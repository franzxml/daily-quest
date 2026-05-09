"use client";

import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MaybePromise, TaskWithStatus } from "@/types/daily-quest";

export function TaskRow({
  onToggleTask,
  task
}: {
  onToggleTask: (taskId: string) => MaybePromise<void>;
  task: TaskWithStatus;
}) {
  return (
    <article className="flex items-start gap-3 px-4 py-4">
      <button
        aria-label={task.isCompletedToday ? "Tandai belum selesai" : "Tandai selesai"}
        aria-pressed={task.isCompletedToday}
        className={cn(
          "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition",
          task.isCompletedToday
            ? "border-teal-700 bg-teal-700 text-white"
            : "border-zinc-300 bg-white text-zinc-400 hover:border-teal-700 hover:text-teal-700"
        )}
        onClick={() => onToggleTask(task.id)}
        title={task.isCompletedToday ? "Tandai belum selesai" : "Tandai selesai"}
        type="button"
      >
        {task.isCompletedToday ? (
          <Check className="h-4 w-4" aria-hidden="true" />
        ) : (
          <Circle className="h-3 w-3" aria-hidden="true" />
        )}
      </button>

      <div className="min-w-0 flex-1">
        <h3
          className={cn(
            "break-words text-sm font-semibold text-zinc-950",
            task.isCompletedToday && "text-zinc-500 line-through"
          )}
        >
          {task.title}
        </h3>
        {task.description ? (
          <p className="mt-1 break-words text-sm text-zinc-500">{task.description}</p>
        ) : null}
      </div>

      <span
        className={cn(
          "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
          task.isCompletedToday ? "bg-teal-50 text-teal-800" : "bg-zinc-100 text-zinc-600"
        )}
      >
        {task.isCompletedToday ? "Selesai" : "Belum"}
      </span>
    </article>
  );
}
