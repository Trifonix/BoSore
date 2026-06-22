import { cookies } from "next/headers";
import { DB_TARGET_COOKIE, type DbTarget } from "./config";

export async function getDbTargetFromCookie(): Promise<DbTarget> {
  const cookieStore = await cookies();
  const value = cookieStore.get(DB_TARGET_COOKIE)?.value;
  return value === "prod" ? "prod" : "local";
}
