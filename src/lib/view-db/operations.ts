import { Prisma, PrismaClient } from "@prisma/client";
import {
  isAllowedTable,
  PAGE_SIZE,
  READ_ONLY_TABLES,
  TABLE_MODEL_MAP,
} from "./config";

type ColumnMeta = {
  name: string;
  dataType: string;
  isNullable: boolean;
  hasDefault: boolean;
};

export async function listPublicTables(
  prisma: PrismaClient,
): Promise<string[]> {
  const rows = await prisma.$queryRaw<{ tablename: string }[]>`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `;

  return rows
    .map((row) => row.tablename)
    .filter((name) => isAllowedTable(name));
}

export async function getTableColumns(
  prisma: PrismaClient,
  table: string,
): Promise<ColumnMeta[]> {
  if (!isAllowedTable(table)) {
    throw new Error("Таблица не разрешена");
  }

  const rows = await prisma.$queryRaw<
    {
      column_name: string;
      data_type: string;
      is_nullable: string;
      column_default: string | null;
    }[]
  >`
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = ${table}
    ORDER BY ordinal_position
  `;

  return rows.map((row) => ({
    name: row.column_name,
    dataType: row.data_type,
    isNullable: row.is_nullable === "YES",
    hasDefault: row.column_default !== null,
  }));
}

function parseValue(value: unknown, dataType: string): unknown {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (dataType.includes("int")) {
    return Number.parseInt(value, 10);
  }

  if (dataType === "boolean") {
    return value === "true";
  }

  if (dataType.includes("timestamp") || dataType === "date") {
    return new Date(value);
  }

  return value;
}

function prepareData(
  body: Record<string, unknown>,
  columns: ColumnMeta[],
  mode: "create" | "update",
): Record<string, unknown> {
  const data: Record<string, unknown> = {};

  for (const column of columns) {
    if (column.name === "id" && mode === "create") {
      if (body.id) {
        data.id = body.id;
      }
      continue;
    }

    if (column.name === "updatedAt") {
      continue;
    }

    if (!(column.name in body)) {
      continue;
    }

    const parsed = parseValue(body[column.name], column.dataType);
    if (parsed === null && !column.isNullable && mode === "create") {
      if (column.hasDefault || column.name === "createdAt") {
        continue;
      }
    }

    data[column.name] = parsed;
  }

  return data;
}

export async function listRows(
  prisma: PrismaClient,
  table: string,
  page = 1,
  pageSize = PAGE_SIZE,
) {
  if (!isAllowedTable(table)) {
    throw new Error("Таблица не разрешена");
  }

  const skip = (page - 1) * pageSize;
  const modelKey = TABLE_MODEL_MAP[table];

  if (modelKey) {
    const model = prisma[modelKey] as unknown as {
      findMany: (args: object) => Promise<unknown[]>;
      count: () => Promise<number>;
    };

    const [rows, total] = await Promise.all([
      model.findMany({
        skip,
        take: pageSize,
        orderBy: { id: "asc" },
      }),
      model.count(),
    ]);

    return { rows, total, page, pageSize, readOnly: false };
  }

  const [rows, countRows] = await Promise.all([
    prisma.$queryRawUnsafe(
      `SELECT * FROM "${table}" ORDER BY "A" LIMIT $1 OFFSET $2`,
      pageSize,
      skip,
    ),
    prisma.$queryRawUnsafe<{ count: bigint }[]>(
      `SELECT COUNT(*)::bigint AS count FROM "${table}"`,
    ),
  ]);

  return {
    rows,
    total: Number(countRows[0]?.count ?? 0),
    page,
    pageSize,
    readOnly: true,
  };
}

export async function createRow(
  prisma: PrismaClient,
  table: string,
  body: Record<string, unknown>,
) {
  if (!isAllowedTable(table) || READ_ONLY_TABLES.has(table)) {
    throw new Error("Таблица недоступна для создания");
  }

  const modelKey = TABLE_MODEL_MAP[table];
  if (!modelKey) {
    throw new Error("Таблица не поддерживается");
  }

  const columns = await getTableColumns(prisma, table);
  const data = prepareData(body, columns, "create");
  const model = prisma[modelKey] as unknown as {
    create: (args: { data: object }) => Promise<unknown>;
  };

  return model.create({ data });
}

export async function updateRow(
  prisma: PrismaClient,
  table: string,
  id: string,
  body: Record<string, unknown>,
) {
  if (!isAllowedTable(table) || READ_ONLY_TABLES.has(table)) {
    throw new Error("Таблица недоступна для изменения");
  }

  const modelKey = TABLE_MODEL_MAP[table];
  if (!modelKey) {
    throw new Error("Таблица не поддерживается");
  }

  const columns = await getTableColumns(prisma, table);
  const data = prepareData(body, columns, "update");
  const model = prisma[modelKey] as unknown as {
    update: (args: { where: { id: string }; data: object }) => Promise<unknown>;
  };

  return model.update({ where: { id }, data });
}

export async function deleteRow(
  prisma: PrismaClient,
  table: string,
  id: string,
) {
  if (!isAllowedTable(table) || READ_ONLY_TABLES.has(table)) {
    throw new Error("Таблица недоступна для удаления");
  }

  const modelKey = TABLE_MODEL_MAP[table];
  if (!modelKey) {
    throw new Error("Таблица не поддерживается");
  }

  const model = prisma[modelKey] as unknown as {
    delete: (args: { where: { id: string } }) => Promise<unknown>;
  };

  return model.delete({ where: { id } });
}

export function serializeRow(row: unknown): Record<string, unknown> {
  return JSON.parse(
    JSON.stringify(row, (_key, value) => {
      if (typeof value === "bigint") {
        return value.toString();
      }
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }),
  ) as Record<string, unknown>;
}

export function isPrismaError(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return error instanceof Prisma.PrismaClientKnownRequestError;
}
