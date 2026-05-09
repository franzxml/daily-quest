"use client";

import { History } from "lucide-react";
import { formatHumanDate, formatShortDate } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { HistoryTask } from "@/types/daily-quest";
import { HistoryRow } from "./history-row";
import { EmptyState, Field, inputClassName, StatusPill } from "./ui";

export function HistoryView({
  completedCount,
  historyDates,
  maxDate,
  onSelectDate,
  selectedDate,
  tasks
}: {
  completedCount: number;
  historyDates: string[];
  maxDate: string;
  onSelectDate: (dateKey: string) => void;
  selectedDate: string;
  tasks: HistoryTask[];
}) {
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      <section className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
        <Field label="Tanggal">
          <input
            className={inputClassName}
            max={maxDate}
            onChange={(event) => onSelectDate(event.target.value)}
            type="date"
            value={selectedDate}
          />
        </Field>

        <div className="mt-4 space-y-2">
          {historyDates.map((dateKey) => (
            <button
              className={cn(
                "flex h-10 w-full items-center justify-between rounded-md border px-3 text-left text-sm transition",
                selectedDate === dateKey
                  ? "border-teal-700 bg-teal-50 text-teal-900"
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              )}
              key={dateKey}
              onClick={() => onSelectDate(dateKey)}
              type="button"
            >
              <span>{formatShortDate(dateKey)}</span>
              <span className="text-xs text-zinc-500">
                {dateKey === maxDate ? "Hari ini" : ""}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-soft">
        <div className="flex flex-col gap-3 border-b border-zinc-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-normal text-zinc-950">Histori task</h2>
            <p className="text-sm text-zinc-500">{formatHumanDate(selectedDate)}</p>
          </div>
          <StatusPill completed={completedCount} progress={progress} total={tasks.length} />
        </div>

        {tasks.length > 0 ? (
          <div className="divide-y divide-zinc-100">
            {tasks.map((task) => (
              <HistoryRow key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <EmptyState icon={History} title="Belum ada task pada tanggal ini." />
        )}
      </section>
    </div>
  );
}
