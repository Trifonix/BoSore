import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** Текущая сессия или null (без редиректа) */
export async function getSession() {
  return auth();
}

/** Требует авторизацию; иначе редирект на /login */
export async function requireAuth(redirectTo = "/login") {
  const session = await auth();

  if (!session?.user?.id) {
    redirect(redirectTo);
  }

  return session;
}

/** Стабильный userId из server-side сессии */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
