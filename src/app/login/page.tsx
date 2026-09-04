import { Suspense } from "react";
import LoginForm from "./login-form";

export const metadata = { title: "Sign in · Crowd Caster" };

export default function LoginPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-500">
            Crowdproductions
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white">Crowd Caster</h1>
          <p className="mt-2 text-sm text-neutral-400">
            Extras catalogue. Enter the team password to continue.
          </p>
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
