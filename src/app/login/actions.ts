"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionValue,
  safeEqual,
} from "@/lib/session";

export type LoginState = { error?: string };

export async function login(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  const expected = process.env.APP_PASSWORD;
  if (!expected) {
    return { error: "Server is missing APP_PASSWORD. Contact the admin." };
  }

  if (!safeEqual(password, expected)) {
    // Slow down brute force a little without blocking the whole server.
    await new Promise((resolve) => setTimeout(resolve, 400));
    return { error: "Wrong password." };
  }

  const store = await cookies();
  store.set(SESSION_COOKIE, await createSessionValue(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  redirect(next.startsWith("/") ? next : "/");
}

export async function logout() {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/login");
}
