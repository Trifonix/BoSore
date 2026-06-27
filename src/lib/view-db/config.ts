import type { PrismaClient } from "@prisma/client";

export type DbTarget = "local" | "prod";

export const DB_TARGET_COOKIE = "view-db-target";

export const PAGE_SIZE = 15;

export const TABLE_MODEL_MAP: Record<
  string,
  keyof Pick<
    PrismaClient,
    "user" | "note" | "category" | "source" | "tag" | "vote" | "account" | "session"
  >
> = {
  User: "user",
  Note: "note",
  Category: "category",
  Source: "source",
  Tag: "tag",
  Vote: "vote",
  Account: "account",
  Session: "session",
};

export const ALLOWED_TABLES = [
  ...Object.keys(TABLE_MODEL_MAP),
  "_SourceToTag",
] as const;

export type AllowedTable = (typeof ALLOWED_TABLES)[number];

export function isAllowedTable(name: string): name is AllowedTable {
  return (ALLOWED_TABLES as readonly string[]).includes(name);
}

export const READ_ONLY_TABLES = new Set<string>([
  "_SourceToTag",
  "VerificationToken",
]);
