import { PrismaClient } from "@prisma/client";
import type { DbTarget } from "./config";
import { sleep } from "./errors";

const globalForViewDb = globalThis as unknown as {
  viewDbClients: Partial<Record<DbTarget, PrismaClient>> | undefined;
};

function createClient(url: string | undefined): PrismaClient {
  if (!url) {
    throw new Error("Строка подключения к БД не задана");
  }

  return new PrismaClient({
    datasources: { db: { url } },
  });
}

export function getDbUrl(target: DbTarget): string | undefined {
  if (target === "local") {
    return process.env.DATABASE_URL;
  }

  const prodUrl = process.env.DATABASE_URL_PROD;
  if (!prodUrl) {
    throw new Error("DATABASE_URL_PROD не задан в .env");
  }

  return prodUrl;
}

export async function resetViewDbClient(target: DbTarget): Promise<void> {
  if (!globalForViewDb.viewDbClients?.[target]) {
    return;
  }

  await globalForViewDb.viewDbClients[target]?.$disconnect();
  delete globalForViewDb.viewDbClients[target];
}

export function getViewDbClient(target: DbTarget): PrismaClient {
  if (!globalForViewDb.viewDbClients) {
    globalForViewDb.viewDbClients = {};
  }

  const cached = globalForViewDb.viewDbClients[target];
  if (cached) {
    return cached;
  }

  const client = createClient(getDbUrl(target));
  globalForViewDb.viewDbClients[target] = client;
  return client;
}

export async function testConnection(
  target: DbTarget,
  retries = 3,
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await resetViewDbClient(target);
      const client = getViewDbClient(target);
      await client.$queryRaw`SELECT 1`;
      return;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(2500 * attempt);
      }
    }
  }

  throw lastError;
}
