"use client";

import { useEffect, useMemo, useState } from "react";
import { ListChecks, LogOut, UserRound } from "lucide-react";
import { DashboardView } from "@/components/daily-quest/dashboard-view";
import { HistoryView } from "@/components/daily-quest/history-view";
import { LoadingScreen } from "@/components/daily-quest/loading-screen";
import { LoginScreen } from "@/components/daily-quest/login-screen";
import { Button } from "@/components/daily-quest/ui";
import { ViewSwitch } from "@/components/daily-quest/view-switch";
import {
  addBackendTask,
  clearBackendSession,
  getBackendDashboard,
  getBackendHistory,
  loadBackendSession,
  loginWithBackend,
  logoutFromBackend,
  setBackendTaskCompletion
} from "@/lib/daily-quest-api";
import {
  createCompletion,
  createProfile,
  createTask,
  emptyDailyQuestState,
  loadDailyQuestState,
  saveDailyQuestState
} from "@/lib/daily-quest-store";
import {
  createBackendState,
  findCompletion,
  getCompletionStatus,
  mergeBackendSnapshot,
  mergeCompletions,
  mergeTasks
} from "@/lib/daily-quest-state";
import type { LoginInput, TaskInput } from "@/lib/daily-quest-schemas";
import { loginInputSchema, taskInputSchema } from "@/lib/daily-quest-schemas";
import {
  dateKeyFromISO,
  formatHumanDate,
  getLocalDateKey,
  getRecentDateKeys
} from "@/lib/dates";
import { errorMessage } from "@/lib/error-message";
import { isSupabaseConfigured } from "@/lib/supabase";
import type {
  BackendSession,
  DailyQuestState,
  DailyQuestView,
  HistoryTask,
  TaskWithStatus
} from "@/types/daily-quest";

export function DailyQuestApp() {
  const useBackend = isSupabaseConfigured();
  const [isHydrated, setIsHydrated] = useState(false);
  const [state, setState] = useState<DailyQuestState>(() => emptyDailyQuestState());
  const [backendSession, setBackendSession] = useState<BackendSession | null>(null);
  const [backendHistoryDates, setBackendHistoryDates] = useState<string[]>([]);
  const [loadError, setLoadError] = useState("");
  const [todayKey, setTodayKey] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [activeView, setActiveView] = useState<DailyQuestView>("dashboard");

  useEffect(() => {
    let isCancelled = false;
    const timer = window.setTimeout(() => {
      const currentDateKey = getLocalDateKey();

      setTodayKey(currentDateKey);
      setSelectedDate(currentDateKey);

      if (!useBackend) {
        setState(loadDailyQuestState());
        setIsHydrated(true);
        return;
      }

      const storedSession = loadBackendSession();

      if (!storedSession) {
        setState(emptyDailyQuestState());
        setIsHydrated(true);
        return;
      }

      getBackendDashboard(storedSession, currentDateKey)
        .then(({ payload, session: nextSession }) => {
          if (isCancelled) {
            return;
          }

          setBackendSession(nextSession);
          setState(createBackendState(payload, nextSession));
          setLoadError("");
        })
        .catch((error) => {
          if (isCancelled) {
            return;
          }

          clearBackendSession();
          setBackendSession(null);
          setState(emptyDailyQuestState());
          setLoadError(errorMessage(error));
        })
        .finally(() => {
          if (!isCancelled) {
            setIsHydrated(true);
          }
        });
    }, 0);

    return () => {
      isCancelled = true;
      window.clearTimeout(timer);
    };
  }, [useBackend]);

  useEffect(() => {
    if (!isHydrated || useBackend) {
      return;
    }

    saveDailyQuestState(state);
  }, [isHydrated, state, useBackend]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const timer = window.setInterval(() => {
      const nextDateKey = getLocalDateKey();

      if (nextDateKey !== todayKey) {
        setTodayKey(nextDateKey);
        setSelectedDate(nextDateKey);

        if (useBackend && backendSession) {
          getBackendDashboard(backendSession, nextDateKey)
            .then(({ payload, session: nextSession }) => {
              setBackendSession(nextSession);
              setState((current) => mergeBackendSnapshot(current, payload, nextSession));
              setLoadError("");
            })
            .catch((error) => setLoadError(errorMessage(error)));
        }
      }
    }, 60_000);

    return () => window.clearInterval(timer);
  }, [backendSession, isHydrated, todayKey, useBackend]);

  useEffect(() => {
    if (
      !isHydrated ||
      !useBackend ||
      !backendSession ||
      activeView !== "history" ||
      !selectedDate ||
      !todayKey
    ) {
      return;
    }

    let isCancelled = false;

    getBackendHistory(backendSession, selectedDate, todayKey)
      .then(({ payload, session: nextSession }) => {
        if (isCancelled) {
          return;
        }

        setBackendSession(nextSession);
        setBackendHistoryDates(payload.historyDates);
        setState((current) => mergeBackendSnapshot(current, payload, nextSession));
        setLoadError("");
      })
      .catch((error) => {
        if (!isCancelled) {
          setLoadError(errorMessage(error));
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [activeView, backendSession, isHydrated, selectedDate, todayKey, useBackend]);

  const session = state.session;
  const user = useMemo(() => {
    if (!session) {
      return null;
    }

    return state.users.find((profile) => profile.id === session.userId) ?? null;
  }, [session, state.users]);

  const userTasks = useMemo(() => {
    if (!user) {
      return [];
    }

    return state.tasks
      .filter((task) => task.userId === user.id && task.isActive)
      .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }, [state.tasks, user]);

  const todayTasks = useMemo<TaskWithStatus[]>(() => {
    if (!user || !todayKey) {
      return [];
    }

    return userTasks.map((task) => ({
      ...task,
      isCompletedToday: getCompletionStatus(state, task.id, user.id, todayKey)
    }));
  }, [state, todayKey, user, userTasks]);

  const historyDates = useMemo(() => {
    if (!user || !todayKey) {
      return [];
    }

    if (useBackend) {
      return backendHistoryDates.length > 0
        ? backendHistoryDates
        : getRecentDateKeys(7, todayKey);
    }

    const dates = new Set<string>(getRecentDateKeys(7, todayKey));

    state.completions
      .filter((completion) => completion.userId === user.id)
      .forEach((completion) => dates.add(completion.completionDate));

    userTasks.forEach((task) => dates.add(dateKeyFromISO(task.createdAt)));

    return Array.from(dates)
      .filter((dateKey) => dateKey <= todayKey)
      .sort((left, right) => right.localeCompare(left));
  }, [backendHistoryDates, state.completions, todayKey, useBackend, user, userTasks]);

  const selectedHistoryTasks = useMemo<HistoryTask[]>(() => {
    if (!user || !selectedDate) {
      return [];
    }

    return userTasks
      .filter((task) => dateKeyFromISO(task.createdAt) <= selectedDate)
      .map((task) => {
        const completion = findCompletion(state, task.id, user.id, selectedDate);

        return {
          ...task,
          completedAt: completion?.completedAt ?? null,
          isCompletedOnDate: completion?.isCompleted ?? false
        };
      });
  }, [selectedDate, state, user, userTasks]);

  if (!isHydrated) {
    return <LoadingScreen />;
  }

  if (!session || !user) {
    return <LoginScreen message={loadError} onLogin={handleLogin} />;
  }

  const completedToday = todayTasks.filter((task) => task.isCompletedToday).length;
  const progress = todayTasks.length > 0 ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  const historyCompleted = selectedHistoryTasks.filter((task) => task.isCompletedOnDate).length;

  return (
    <div className="min-h-dvh bg-[#f7f8f5]">
      <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ListChecks className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold text-zinc-950">Daily Quest</p>
              <p className="truncate text-sm text-zinc-500">{formatHumanDate(todayKey)}</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <ViewSwitch activeView={activeView} onChange={setActiveView} />
            <Button variant="secondary" onClick={handleLogout}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Keluar
            </Button>
          </div>

          <div className="md:hidden">
            <Button variant="secondary" size="icon" onClick={handleLogout} aria-label="Keluar">
              <LogOut className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 pb-3 md:hidden">
          <ViewSwitch activeView={activeView} onChange={setActiveView} />
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 py-5 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <UserRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-zinc-950">{user.name}</p>
                  <p className="truncate text-xs text-zinc-500">{user.email}</p>
                </div>
              </div>
            </div>

            <ViewSwitch activeView={activeView} onChange={setActiveView} isVertical />
          </div>
        </aside>

        <main className="min-w-0">
          {loadError ? (
            <p className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {loadError}
            </p>
          ) : null}

          {activeView === "dashboard" ? (
            <DashboardView
              completedToday={completedToday}
              onAddTask={handleAddTask}
              onToggleTask={handleToggleTask}
              progress={progress}
              tasks={todayTasks}
              todayKey={todayKey}
            />
          ) : (
            <HistoryView
              completedCount={historyCompleted}
              historyDates={historyDates}
              maxDate={todayKey}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
              tasks={selectedHistoryTasks}
            />
          )}
        </main>
      </div>
    </div>
  );

  async function handleLogin(input: LoginInput) {
    const parsed = loginInputSchema.safeParse(input);

    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? "Email atau password tidak valid.";
    }

    if (useBackend) {
      try {
        const loginPayload = await loginWithBackend(parsed.data);
        const date = todayKey || getLocalDateKey();
        const { payload, session: nextSession } = await getBackendDashboard(
          loginPayload.session,
          date
        );

        setBackendSession(nextSession);
        setBackendHistoryDates([]);
        setState(createBackendState(payload, nextSession));
        setLoadError("");

        return null;
      } catch (error) {
        return errorMessage(error);
      }
    }

    setState((current) => {
      const existingUser = current.users.find((profile) => profile.email === parsed.data.email);
      const profile = existingUser ?? createProfile(parsed.data.email);

      return {
        ...current,
        session: {
          email: profile.email,
          signedInAt: new Date().toISOString(),
          userId: profile.id
        },
        users: existingUser ? current.users : [...current.users, profile]
      };
    });

    return null;
  }

  async function handleLogout() {
    if (useBackend) {
      const activeSession = backendSession;

      setBackendSession(null);
      setBackendHistoryDates([]);
      setState(emptyDailyQuestState());
      setLoadError("");

      if (activeSession) {
        await logoutFromBackend(activeSession);
      }

      return;
    }

    setState((current) => ({
      ...current,
      session: null
    }));
  }

  async function handleAddTask(input: TaskInput) {
    if (!session) {
      return "Sesi tidak ditemukan.";
    }

    const parsed = taskInputSchema.safeParse(input);

    if (!parsed.success) {
      return parsed.error.issues[0]?.message ?? "Task tidak valid.";
    }

    if (useBackend) {
      if (!backendSession) {
        return "Sesi backend tidak ditemukan.";
      }

      try {
        const { payload, session: nextSession } = await addBackendTask(
          backendSession,
          parsed.data
        );

        setBackendSession(nextSession);
        setState((current) => ({
          ...current,
          tasks: mergeTasks(current.tasks, [payload.task])
        }));
        setLoadError("");

        return null;
      } catch (error) {
        return errorMessage(error);
      }
    }

    setState((current) => ({
      ...current,
      tasks: [
        ...current.tasks,
        createTask(session.userId, parsed.data.title, parsed.data.description ?? "")
      ]
    }));

    return null;
  }

  async function handleToggleTask(taskId: string) {
    if (!session || !todayKey) {
      return;
    }

    if (useBackend) {
      if (!backendSession) {
        setLoadError("Sesi backend tidak ditemukan.");
        return;
      }

      const existing = findCompletion(state, taskId, session.userId, todayKey);
      const nextCompleted = !(existing?.isCompleted ?? false);

      try {
        const { payload, session: nextSession } = await setBackendTaskCompletion(
          backendSession,
          taskId,
          {
            completionDate: todayKey,
            isCompleted: nextCompleted
          }
        );

        setBackendSession(nextSession);
        setState((current) => ({
          ...current,
          completions: mergeCompletions(current.completions, [payload.completion])
        }));
        setLoadError("");
      } catch (error) {
        setLoadError(errorMessage(error));
      }

      return;
    }

    setState((current) => {
      const existing = findCompletion(current, taskId, session.userId, todayKey);
      const nextCompleted = !(existing?.isCompleted ?? false);
      const now = new Date().toISOString();

      if (!existing) {
        return {
          ...current,
          completions: [
            ...current.completions,
            createCompletion(taskId, session.userId, todayKey, nextCompleted)
          ]
        };
      }

      return {
        ...current,
        completions: current.completions.map((completion) =>
          completion.id === existing.id
            ? {
                ...completion,
                completedAt: nextCompleted ? now : null,
                isCompleted: nextCompleted,
                updatedAt: now
              }
            : completion
        )
      };
    });
  }
}
