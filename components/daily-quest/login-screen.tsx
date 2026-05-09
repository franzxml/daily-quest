"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { Check, History, ListChecks, LogIn, Sparkles, Target } from "lucide-react";
import type { LoginInput } from "@/lib/daily-quest-schemas";
import type { MaybePromise } from "@/types/daily-quest";
import { Button, Field, inputClassName, MetricCard } from "./ui";

export function LoginScreen({
  message,
  onLogin
}: {
  message?: string;
  onLogin: (input: LoginInput) => MaybePromise<string | null>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const nextError = await onLogin({ email, password });
      setError(nextError ?? "");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-dvh bg-[#f7f8f5] lg:grid-cols-[minmax(0,1fr)_460px]">
      <section className="hidden items-center justify-center border-r border-zinc-200 bg-white px-10 lg:flex">
        <div className="w-full max-w-xl">
          <div className="mb-8 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-teal-700 text-white">
              <Sparkles className="h-7 w-7" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-4xl font-semibold tracking-normal text-zinc-950">Daily Quest</h1>
              <p className="mt-1 text-base text-zinc-500">Catatan aktivitas harian pribadi</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MetricCard icon={Target} label="Fokus" value="Harian" tone="teal" />
            <MetricCard icon={Check} label="Status" value="Tersimpan" tone="amber" />
            <MetricCard icon={History} label="Histori" value="Rapi" tone="rose" />
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-10">
        <form
          className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-5 shadow-soft sm:p-6"
          onSubmit={handleSubmit}
          noValidate
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-teal-700 text-white">
              <ListChecks className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-zinc-950">Daily Quest</h1>
              <p className="text-sm text-zinc-500">Catatan aktivitas harian pribadi</p>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-medium text-teal-700">Masuk</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-zinc-950">
              Akun pribadi
            </h2>
          </div>

          <div className="space-y-4">
            <Field label="Email">
              <input
                className={inputClassName}
                inputMode="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nama@email.com"
                type="email"
                value={email}
              />
            </Field>

            <Field label="Password">
              <input
                className={inputClassName}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimal 6 karakter"
                type="password"
                value={password}
              />
            </Field>
          </div>

          {error || message ? (
            <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {error || message}
            </p>
          ) : null}

          <Button className="mt-5 w-full" disabled={isSubmitting} type="submit">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {isSubmitting ? "Memproses" : "Masuk"}
          </Button>
        </form>
      </section>
    </main>
  );
}
