import type {
  DailyQuestState,
  Task,
  TaskCompletion,
  UserProfile
} from "@/types/daily-quest";
import { nameFromEmail } from "@/lib/user-profile";

const STORAGE_KEY = "daily-quest:v1";

export function emptyDailyQuestState(): DailyQuestState {
  return {
    users: [],
    tasks: [],
    completions: [],
    session: null
  };
}

export function loadDailyQuestState(): DailyQuestState {
  if (typeof window === "undefined") {
    return emptyDailyQuestState();
  }

  try {
    const rawValue = window.localStorage.getItem(STORAGE_KEY);
    if (!rawValue) {
      return emptyDailyQuestState();
    }

    const parsed = JSON.parse(rawValue) as Partial<DailyQuestState>;

    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
      completions: Array.isArray(parsed.completions) ? parsed.completions : [],
      session: parsed.session ?? null
    };
  } catch {
    return emptyDailyQuestState();
  }
}

export function saveDailyQuestState(state: DailyQuestState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function createProfile(email: string): UserProfile {
  const now = new Date().toISOString();

  return {
    id: createId("usr"),
    email,
    name: nameFromEmail(email),
    createdAt: now
  };
}

export function createTask(userId: string, title: string, description: string): Task {
  const now = new Date().toISOString();

  return {
    id: createId("tsk"),
    userId,
    title,
    description,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };
}

export function createCompletion(
  taskId: string,
  userId: string,
  completionDate: string,
  isCompleted: boolean
): TaskCompletion {
  const now = new Date().toISOString();

  return {
    id: createId("cmp"),
    taskId,
    userId,
    completionDate,
    isCompleted,
    completedAt: isCompleted ? now : null,
    updatedAt: now
  };
}

function createId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}
