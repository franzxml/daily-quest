"use client";

import { Check, ListChecks, Target } from "lucide-react";
import type { TaskInput } from "@/lib/daily-quest-schemas";
import { formatHumanDate } from "@/lib/dates";
import type { MaybePromise, TaskWithStatus } from "@/types/daily-quest";
import { TaskForm } from "./task-form";
import { TaskRow } from "./task-row";
import { EmptyState, MetricCard } from "./ui";

export function DashboardView({
  completedToday,
  onAddTask,
  onToggleTask,
  progress,
  tasks,
  todayKey
}: {
  completedToday: number;
  onAddTask: (input: TaskInput) => MaybePromise<string | null>;
  onToggleTask: (taskId: string) => MaybePromise<void>;
  progress: number;
  tasks: TaskWithStatus[];
  todayKey: string;
}) {
  return (
    <div className="space-y-5">
      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard icon={ListChecks} label="Task" value={String(tasks.length)} tone="teal" />
        <MetricCard icon={Check} label="Selesai" value={String(completedToday)} tone="amber" />
        <MetricCard icon={Target} label="Progress" value={`${progress}%`} tone="rose" />
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
        <TaskForm onAddTask={onAddTask} />
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-zinc-950">Task hari ini</h2>
            <p className="text-sm text-zinc-500">{formatHumanDate(todayKey)}</p>
          </div>
          <div className="min-w-40">
            <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
              <span>
                {completedToday}/{tasks.length}
              </span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-teal-700 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {tasks.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {tasks.map((task) => (
              <TaskRow key={task.id} onToggleTask={onToggleTask} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState icon={ListChecks} title="Belum ada task hari ini." />
        )}
      </section>
    </div>
  );
}
