"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Plus } from "lucide-react";
import type { TaskInput } from "@/lib/daily-quest-schemas";
import type { MaybePromise } from "@/types/daily-quest";
import { Button, Field, inputClassName } from "./ui";

export function TaskForm({
  onAddTask
}: {
  onAddTask: (input: TaskInput) => MaybePromise<string | null>;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const nextError = await onAddTask({ title, description });
      setError(nextError ?? "");

      if (!nextError) {
        setTitle("");
        setDescription("");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] lg:items-end">
        <Field label="Task">
          <input
            className={inputClassName}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Contoh: olahraga pagi"
            value={title}
          />
        </Field>

        <Field label="Catatan">
          <input
            className={inputClassName}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Opsional"
            value={description}
          />
        </Field>

        <Button className="lg:w-auto" disabled={isSubmitting} type="submit">
          <Plus className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? "Menyimpan" : "Tambah"}
        </Button>
      </div>

      {error ? (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {error}
        </p>
      ) : null}
    </form>
  );
}
