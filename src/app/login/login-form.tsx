"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "./actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-amber-400 disabled:opacity-60"
    >
      {pending ? "Checking…" : "Sign in"}
    </button>
  );
}

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const [state, formAction] = useActionState<LoginState, FormData>(login, {});

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-2xl border border-neutral-800 bg-neutral-900 p-6"
    >
      <input type="hidden" name="next" value={next} />
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-neutral-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoFocus
          autoComplete="current-password"
          className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-amber-500"
          placeholder="••••••••"
        />
      </div>
      {state.error ? (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {state.error}
        </p>
      ) : null}
      <SubmitButton />
    </form>
  );
}
