"use client";

import type { LucideIcon } from "lucide-react";
import { History, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DailyQuestView } from "@/types/daily-quest";

const viewSwitchItems: Array<{
  icon: LucideIcon;
  label: string;
  value: DailyQuestView;
}> = [
  { icon: ListChecks, label: "Dashboard", value: "dashboard" },
  { icon: History, label: "Histori", value: "history" }
];

export function ViewSwitch({
  activeView,
  isVertical = false,
  onChange
}: {
  activeView: DailyQuestView;
  isVertical?: boolean;
  onChange: (view: DailyQuestView) => void;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 rounded-lg border border-zinc-200 bg-white p-1",
        isVertical ? "grid-cols-1" : "grid-cols-2"
      )}
    >
      {viewSwitchItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.value;

        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition",
              isVertical && "justify-start",
              isActive
                ? "bg-teal-700 text-white"
                : "bg-transparent text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
            )}
            key={item.value}
            onClick={() => onChange(item.value)}
            type="button"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </div>
  );
}
