import type { SupabaseClient, User } from "@supabase/supabase-js";
import { dateKeyFromISO, getRecentDateKeys } from "@/lib/dates";
import { ApiError } from "@/lib/server/api-errors";
import { nameFromEmail } from "@/lib/user-profile";
import type { Task, TaskCompletion, UserProfile } from "@/types/daily-quest";

type ProfileRow = {
  id: string;
  email: string;
  name: string | null;
  created_at: string;
};

type TaskRow = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type CompletionRow = {
  id: string;
  task_id: string;
  user_id: string;
  completion_date: string;
  is_completed: boolean;
  completed_at: string | null;
  updated_at: string;
};

const profileColumns = "id,email,name,created_at";
const taskColumns = "id,user_id,title,description,is_active,created_at,updated_at";
const completionColumns =
  "id,task_id,user_id,completion_date,is_completed,completed_at,updated_at";

export type DailyQuestSnapshot = {
  completions: TaskCompletion[];
  tasks: Task[];
  user: UserProfile;
};

export type DailyQuestHistory = DailyQuestSnapshot & {
  historyDates: string[];
  selectedDate: string;
};

export async function upsertProfile(supabase: SupabaseClient, user: User) {
  const email = user.email;

  if (!email) {
    throw new ApiError(400, "EMAIL_REQUIRED", "Akun Supabase tidak memiliki email.");
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert(
      {
        email,
        id: user.id,
        name: nameFromUser(user)
      },
      { onConflict: "id" }
    )
    .select(profileColumns)
    .single();

  if (error || !data) {
    throw new ApiError(500, "PROFILE_SAVE_FAILED", "Profil pengguna gagal disimpan.");
  }

  return mapProfile(data as ProfileRow);
}

export async function getProfile(supabase: SupabaseClient, user: User) {
  const { data, error } = await supabase
    .from("profiles")
    .select(profileColumns)
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "PROFILE_FETCH_FAILED", "Profil pengguna gagal dibaca.");
  }

  return data ? mapProfile(data as ProfileRow) : upsertProfile(supabase, user);
}

export async function getDashboardSnapshot(
  supabase: SupabaseClient,
  user: User,
  dateKey: string
): Promise<DailyQuestSnapshot> {
  const [profile, taskSnapshot] = await Promise.all([
    getProfile(supabase, user),
    getTaskSnapshot(supabase, user.id, dateKey)
  ]);

  return {
    ...taskSnapshot,
    user: profile
  };
}

export async function getHistorySnapshot(
  supabase: SupabaseClient,
  user: User,
  selectedDate: string,
  todayKey: string
): Promise<DailyQuestHistory> {
  const [dashboard, historyDates] = await Promise.all([
    getDashboardSnapshot(supabase, user, selectedDate),
    getHistoryDates(supabase, user.id, todayKey)
  ]);

  return {
    ...dashboard,
    historyDates,
    selectedDate
  };
}

export async function createUserTask(
  supabase: SupabaseClient,
  userId: string,
  input: {
    description?: string;
    title: string;
  }
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("tasks")
    .insert({
      description: input.description?.trim() ?? "",
      is_active: true,
      title: input.title,
      updated_at: now,
      user_id: userId
    })
    .select(taskColumns)
    .single();

  if (error || !data) {
    throw new ApiError(500, "TASK_CREATE_FAILED", "Task gagal disimpan.");
  }

  return mapTask(data as TaskRow);
}

export async function setTaskCompletion(
  supabase: SupabaseClient,
  userId: string,
  taskId: string,
  completionDate: string,
  isCompleted: boolean
) {
  await ensureActiveTaskBelongsToUser(supabase, userId, taskId);

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("task_completions")
    .upsert(
      {
        completed_at: isCompleted ? now : null,
        completion_date: completionDate,
        is_completed: isCompleted,
        task_id: taskId,
        updated_at: now,
        user_id: userId
      },
      { onConflict: "task_id,user_id,completion_date" }
    )
    .select(completionColumns)
    .single();

  if (error || !data) {
    throw new ApiError(
      500,
      "COMPLETION_SAVE_FAILED",
      "Status penyelesaian task gagal disimpan."
    );
  }

  return mapCompletion(data as CompletionRow);
}

async function getTaskSnapshot(
  supabase: SupabaseClient,
  userId: string,
  dateKey: string
) {
  const [tasksResult, completionsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select(taskColumns)
      .eq("user_id", userId)
      .eq("is_active", true)
      .lte("created_at", `${dateKey}T23:59:59.999Z`)
      .order("created_at", { ascending: true }),
    supabase
      .from("task_completions")
      .select(completionColumns)
      .eq("user_id", userId)
      .eq("completion_date", dateKey)
  ]);

  if (tasksResult.error) {
    throw new ApiError(500, "TASK_FETCH_FAILED", "Daftar task gagal dibaca.");
  }

  if (completionsResult.error) {
    throw new ApiError(500, "COMPLETION_FETCH_FAILED", "Histori task gagal dibaca.");
  }

  return {
    completions: ((completionsResult.data ?? []) as CompletionRow[]).map(mapCompletion),
    tasks: ((tasksResult.data ?? []) as TaskRow[]).map(mapTask)
  };
}

async function getHistoryDates(
  supabase: SupabaseClient,
  userId: string,
  todayKey: string
) {
  const [tasksResult, completionsResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("created_at")
      .eq("user_id", userId)
      .eq("is_active", true),
    supabase
      .from("task_completions")
      .select("completion_date")
      .eq("user_id", userId)
  ]);

  if (tasksResult.error) {
    throw new ApiError(500, "TASK_FETCH_FAILED", "Daftar tanggal task gagal dibaca.");
  }

  if (completionsResult.error) {
    throw new ApiError(
      500,
      "COMPLETION_FETCH_FAILED",
      "Daftar tanggal histori gagal dibaca."
    );
  }

  const dates = new Set<string>(getRecentDateKeys(7, todayKey));

  (tasksResult.data ?? []).forEach((task) => {
    const createdAt = (task as Pick<TaskRow, "created_at">).created_at;
    dates.add(dateKeyFromISO(createdAt));
  });

  (completionsResult.data ?? []).forEach((completion) => {
    dates.add((completion as Pick<CompletionRow, "completion_date">).completion_date);
  });

  return Array.from(dates)
    .filter((dateKey) => dateKey <= todayKey)
    .sort((left, right) => right.localeCompare(left));
}

async function ensureActiveTaskBelongsToUser(
  supabase: SupabaseClient,
  userId: string,
  taskId: string
) {
  const { data, error } = await supabase
    .from("tasks")
    .select("id")
    .eq("id", taskId)
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "TASK_FETCH_FAILED", "Task gagal dibaca.");
  }

  if (!data) {
    throw new ApiError(404, "TASK_NOT_FOUND", "Task tidak ditemukan.");
  }
}

function mapProfile(row: ProfileRow): UserProfile {
  return {
    createdAt: row.created_at,
    email: row.email,
    id: row.id,
    name: row.name ?? nameFromEmail(row.email)
  };
}

function mapTask(row: TaskRow): Task {
  return {
    createdAt: row.created_at,
    description: row.description,
    id: row.id,
    isActive: row.is_active,
    title: row.title,
    updatedAt: row.updated_at,
    userId: row.user_id
  };
}

function mapCompletion(row: CompletionRow): TaskCompletion {
  return {
    completedAt: row.completed_at,
    completionDate: row.completion_date,
    id: row.id,
    isCompleted: row.is_completed,
    taskId: row.task_id,
    updatedAt: row.updated_at,
    userId: row.user_id
  };
}

function nameFromUser(user: User) {
  const name =
    typeof user.user_metadata.name === "string"
      ? user.user_metadata.name
      : typeof user.user_metadata.full_name === "string"
        ? user.user_metadata.full_name
        : null;

  return name?.trim() || nameFromEmail(user.email ?? "");
}
