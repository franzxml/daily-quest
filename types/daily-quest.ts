export type DailyQuestView = "dashboard" | "history";

export type MaybePromise<T> = T | Promise<T>;

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type Task = {
  id: string;
  userId: string;
  title: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaskCompletion = {
  id: string;
  taskId: string;
  userId: string;
  completionDate: string;
  isCompleted: boolean;
  completedAt: string | null;
  updatedAt: string;
};

export type Session = {
  userId: string;
  email: string;
  signedInAt: string;
};

export type BackendSession = Session & {
  accessToken: string;
  expiresAt: number | null;
  refreshToken: string;
};

export type DailyQuestState = {
  users: UserProfile[];
  tasks: Task[];
  completions: TaskCompletion[];
  session: Session | null;
};

export type DailyQuestSnapshot = {
  completions: TaskCompletion[];
  tasks: Task[];
  user: UserProfile;
};

export type DailyQuestHistorySnapshot = DailyQuestSnapshot & {
  historyDates: string[];
  selectedDate: string;
};

export type TaskWithStatus = Task & {
  isCompletedToday: boolean;
};

export type HistoryTask = Task & {
  isCompletedOnDate: boolean;
  completedAt: string | null;
};
