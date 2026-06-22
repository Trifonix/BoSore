import { NextResponse } from "next/server";
import { testConnection } from "@/lib/view-db/client";
import { DB_TARGET_COOKIE, type DbTarget } from "@/lib/view-db/config";
import { formatDbError } from "@/lib/view-db/errors";
import { isViewDbEnabled } from "@/lib/view-db/guard";

export async function POST(request: Request) {
  if (!isViewDbEnabled()) {
    return NextResponse.json({ error: "view-db отключён" }, { status: 404 });
  }

  const body = (await request.json()) as { target?: DbTarget };
  const target: DbTarget = body.target === "prod" ? "prod" : "local";

  try {
    await testConnection(target);
  } catch (error) {
    return NextResponse.json({ error: formatDbError(error) }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true, target });
  response.cookies.set(DB_TARGET_COOKIE, target, {
    httpOnly: true,
    sameSite: "lax",
    path: "/view-db",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
