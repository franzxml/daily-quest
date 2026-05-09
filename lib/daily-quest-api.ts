import type {
  BackendSession,
  DailyQuestHistorySnapshot,
  DailyQuestSnapshot,
  Task,
  TaskCompletion,
  UserProfile
} from "@/types/daily-quest";
import type { CompletionInput, LoginInput, TaskInput } from "@/lib/daily-quest-schemas";

const BACKEND_SESSION_KEY = "daily-quest:backend-session:v1";

type ApiEnvelope<T> = {
  data?: T;
  error?: {
    code: string;
    message: string;
  };
};

type SessionResponse = {
  session: BackendSession;
  user: UserProfile;
};

export type BackendResult<T> = {
  payload: T;
  session: BackendSession;
};

export function loadBackendSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawValue = window.localStorage.getItem(BACKEND_SESSION_KEY);

    if (!rawValue) {
      return null;
    }

    const parsed = JSON.parse(rawValue) as Partial<BackendSession>;

    if (!parsed.accessToken || !parsed.refreshToken || !parsed.userId || !parsed.email) {
      return null;
    }

    return parsed as BackendSession;
  } catch {
    return null;
  }
}

export function saveBackendSession(session: BackendSession) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(BACKEND_SESSION_KEY, JSON.stringify(session));
}

export function clearBackendSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BACKEND_SESSION_KEY);
}

export async function loginWithBackend(input: LoginInput) {
  const payload = await request<SessionResponse>("/api/auth/login", {
    body: JSON.stringify(input),
    method: "POST"
  });

  saveBackendSession(payload.session);

  return payload;
}

export async function logoutFromBackend(session: BackendSession) {
  await requestWithSession<{ ok: boolean }>(session, "/api/auth/logout", {
    method: "POST"
  }).catch(() => null);
  clearBackendSession();
}

export async function getBackendDashboard(
  session: BackendSession,
  date: string
): Promise<BackendResult<DailyQuestSnapshot>> {
  const result = await requestWithSession<DailyQuestSnapshot & { date: string }>(
    session,
    `/api/tasks?date=${encodeURIComponent(date)}`
  );

  return result;
}

export async function getBackendHistory(
  session: BackendSession,
  selectedDate: string,
  today: string
): Promise<BackendResult<DailyQuestHistorySnapshot>> {
  return requestWithSession<DailyQuestHistorySnapshot>(
    session,
    `/api/history?date=${encodeURIComponent(selectedDate)}&today=${encodeURIComponent(today)}`
  );
}

export async function addBackendTask(
  session: BackendSession,
  input: TaskInput
): Promise<BackendResult<{ task: Task }>> {
  return requestWithSession<{ task: Task }>(session, "/api/tasks", {
    body: JSON.stringify(input),
    method: "POST"
  });
}

export async function setBackendTaskCompletion(
  session: BackendSession,
  taskId: string,
  input: CompletionInput
): Promise<BackendResult<{ completion: TaskCompletion }>> {
  return requestWithSession<{ completion: TaskCompletion }>(
    session,
    `/api/tasks/${encodeURIComponent(taskId)}/completion`,
    {
      body: JSON.stringify(input),
      method: "PUT"
    }
  );
}

async function requestWithSession<T>(
  session: BackendSession,
  path: string,
  init: RequestInit = {}
): Promise<BackendResult<T>> {
  let activeSession = session;
  let response = await fetchWithAuth(path, activeSession.accessToken, init);

  if (response.status === 401 && activeSession.refreshToken) {
    activeSession = (await refreshBackendSession(activeSession.refreshToken)).session;
    saveBackendSession(activeSession);
    response = await fetchWithAuth(path, activeSession.accessToken, init);
  }

  const payload = await parseResponse<T>(response);

  return {
    payload,
    session: activeSession
  };
}

async function refreshBackendSession(refreshToken: string) {
  return request<SessionResponse>("/api/auth/refresh", {
    body: JSON.stringify({ refreshToken }),
    method: "POST"
  });
}

async function fetchWithAuth(path: string, accessToken: string, init: RequestInit = {}) {
  return fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers,
      Authorization: `Bearer ${accessToken}`
    }
  });
}

async function request<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init.headers
    }
  });

  return parseResponse<T>(response);
}

async function parseResponse<T>(response: Response) {
  const envelope = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;

  if (!response.ok || envelope.error) {
    throw new Error(envelope.error?.message ?? "Request backend gagal.");
  }

  if (!envelope.data) {
    throw new Error("Response backend tidak valid.");
  }

  return envelope.data;
}
