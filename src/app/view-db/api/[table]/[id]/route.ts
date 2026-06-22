import { NextResponse } from "next/server";
import { getViewDbClient } from "@/lib/view-db/client";
import { isAllowedTable } from "@/lib/view-db/config";
import { isViewDbEnabled } from "@/lib/view-db/guard";
import {
  deleteRow,
  isPrismaError,
  serializeRow,
  updateRow,
} from "@/lib/view-db/operations";
import { getDbTargetFromCookie } from "@/lib/view-db/target";

type RouteContext = {
  params: Promise<{ table: string; id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  if (!isViewDbEnabled()) {
    return NextResponse.json({ error: "view-db отключён" }, { status: 404 });
  }

  const { table, id } = await context.params;
  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: "Таблица не найдена" }, { status: 404 });
  }

  try {
    const target = await getDbTargetFromCookie();
    const prisma = getViewDbClient(target);
    const body = (await request.json()) as Record<string, unknown>;
    const row = await updateRow(prisma, table, id, body);

    return NextResponse.json({ row: serializeRow(row) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка обновления записи";
    const status = isPrismaError(error) && error.code === "P2025" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isViewDbEnabled()) {
    return NextResponse.json({ error: "view-db отключён" }, { status: 404 });
  }

  const { table, id } = await context.params;
  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: "Таблица не найдена" }, { status: 404 });
  }

  try {
    const target = await getDbTargetFromCookie();
    const prisma = getViewDbClient(target);
    const row = await deleteRow(prisma, table, id);

    return NextResponse.json({ row: serializeRow(row) });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка удаления записи";
    const status = isPrismaError(error) && error.code === "P2025" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
