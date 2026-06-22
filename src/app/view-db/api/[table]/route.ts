import { NextResponse } from "next/server";
import { getViewDbClient } from "@/lib/view-db/client";
import { isAllowedTable } from "@/lib/view-db/config";
import { isViewDbEnabled } from "@/lib/view-db/guard";
import {
  createRow,
  getTableColumns,
  listRows,
  serializeRow,
} from "@/lib/view-db/operations";
import { getDbTargetFromCookie } from "@/lib/view-db/target";

type RouteContext = {
  params: Promise<{ table: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  if (!isViewDbEnabled()) {
    return NextResponse.json({ error: "view-db отключён" }, { status: 404 });
  }

  const { table } = await context.params;
  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: "Таблица не найдена" }, { status: 404 });
  }

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10));
  const pageSize = Math.min(
    50,
    Math.max(1, Number.parseInt(searchParams.get("pageSize") ?? "15", 10)),
  );

  try {
    const target = await getDbTargetFromCookie();
    const prisma = getViewDbClient(target);
    const [result, columns] = await Promise.all([
      listRows(prisma, table, page, pageSize),
      getTableColumns(prisma, table),
    ]);

    return NextResponse.json({
      target,
      table,
      columns,
      rows: (result.rows as Record<string, unknown>[]).map(serializeRow),
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      readOnly: result.readOnly,
      totalPages: Math.max(1, Math.ceil(result.total / result.pageSize)),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка чтения таблицы";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  if (!isViewDbEnabled()) {
    return NextResponse.json({ error: "view-db отключён" }, { status: 404 });
  }

  const { table } = await context.params;
  if (!isAllowedTable(table)) {
    return NextResponse.json({ error: "Таблица не найдена" }, { status: 404 });
  }

  try {
    const target = await getDbTargetFromCookie();
    const prisma = getViewDbClient(target);
    const body = (await request.json()) as Record<string, unknown>;
    const row = await createRow(prisma, table, body);

    return NextResponse.json({ row: serializeRow(row) }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка создания записи";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
