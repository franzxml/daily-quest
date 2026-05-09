import type {
  BackendSession,
  DailyQuestSnapshot,
  DailyQuestState,
  Session,
  Task,
  TaskCompletion,
  UserProfile
} from "@/types/daily-quest";

export function createBackendState(
  snapshot: DailyQuestSnapshot,
  backendSession: BackendSession
): DailyQuestState {
  return {
    completions: snapshot.completions,
    session: sessionFromBackend(backendSession),
    tasks: snapshot.tasks,
    users: [snapshot.user]
  };
}

export function mergeBackendSnapshot(
  current: DailyQuestState,
  snapshot: DailyQuestSnapshot,
  backendSession: BackendSession
): DailyQuestState {
  return {
    completions: mergeCompletions(current.completions, snapshot.completions),
    session: sessionFromBackend(backendSession),
    tasks: mergeTasks(current.tasks, snapshot.tasks),
    users: mergeProfiles(current.users, [snapshot.user])
  };
}

export function mergeTasks(current: Task[], incoming: Task[]) {
  return mergeById(current, incoming).sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt)
  );
}

export function mergeCompletions(current: TaskCompletion[], incoming: TaskCompletion[]) {
  return mergeById(current, incoming);
}

export function getCompletionStatus(
  state: DailyQuestState,
  taskId: string,
  userId: string,
  dateKey: string
) {
  return findCompletion(state, taskId, userId, dateKey)?.isCompleted ?? false;
}

export function findCompletion(
  state: DailyQuestState,
  taskId: string,
  userId: string,
  dateKey: string
) {
  return state.completions.find(
    (completion) =>
      completion.taskId === taskId &&
      completion.userId === userId &&
      completion.completionDate === dateKey
  );
}

function sessionFromBackend(session: BackendSession): Session {
  return {
    email: session.email,
    signedInAt: session.signedInAt,
    userId: session.userId
  };
}

function mergeProfiles(current: UserProfile[], incoming: UserProfile[]) {
  return mergeById(current, incoming);
}

function mergeById<T extends { id: string }>(current: T[], incoming: T[]) {
  const values = new Map(current.map((item) => [item.id, item]));

  incoming.forEach((item) => values.set(item.id, item));

  return Array.from(values.values());
}
