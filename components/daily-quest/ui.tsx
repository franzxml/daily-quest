"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export const inputClassName =
  "h-10 w-full rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-700/15";

export function Button({
  children,
  className,
  size = "default",
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  size?: "default" | "icon";
  variant?: "primary" | "secondary";
}) {
  return (
    <button
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        size === "icon" ? "h-10 w-10" : "h-10 px-4",
        variant === "primary"
          ? "bg-teal-700 text-white hover:bg-teal-800"
          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function EmptyState({
  icon: Icon,
  title
}: {
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="grid min-h-44 place-items-center px-4 py-10 text-center">
      <div>
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <p className="mt-3 text-sm font-medium text-zinc-600">{title}</p>
      </div>
    </div>
  );
}

export function Field({
  children,
  label
}: {
  children: ReactNode;
  label: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-zinc-700">{label}</span>
      {children}
    </label>
  );
}

export function MetricCard({
  icon: Icon,
  label,
  tone,
  value
}: {
  icon: LucideIcon;
  label: string;
  tone: "teal" | "amber" | "rose";
  value: string;
}) {
  const toneClassName = {
    amber: "bg-amber-100 text-amber-800",
    rose: "bg-rose-100 text-rose-800",
    teal: "bg-teal-100 text-teal-800"
  }[tone];

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm text-zinc-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold tracking-normal text-zinc-950">{value}</p>
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            toneClassName
          )}
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}

export function StatusPill({
  completed,
  progress,
  total
}: {
  completed: number;
  progress: number;
  total: number;
}) {
  return (
    <div className="flex h-10 items-center gap-3 rounded-full border border-zinc-200 bg-zinc-50 px-3 text-sm text-zinc-700">
      <span>
        {completed}/{total}
      </span>
      <span className="h-4 w-px bg-zinc-200" />
      <span>{progress}%</span>
    </div>
  );
}
