import type { Visibility } from "@prisma/client";

/** Публичная лента: только PUBLIC источники */
export const publicSourcesFilter = {
  visibility: "PUBLIC" as Visibility,
};

/** Источники владельца (приватные + публичные) */
export function ownerSourcesFilter(ownerId: string) {
  return { ownerId };
}

/** Доступ к одному источнику: публичный или свой */
export function readableSourceFilter(sourceId: string, userId?: string | null) {
  if (userId) {
    return {
      id: sourceId,
      OR: [{ visibility: "PUBLIC" as Visibility }, { ownerId: userId }],
    };
  }

  return {
    id: sourceId,
    visibility: "PUBLIC" as Visibility,
  };
}
