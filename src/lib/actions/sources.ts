"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth/session";
import { sourceFormSchema } from "@/lib/validations/source";

const DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/public",
  "/dashboard/favorites",
];

function revalidateDashboard() {
  for (const path of DASHBOARD_PATHS) {
    revalidatePath(path);
  }
}

async function getDefaultCategoryId() {
  const existing = await prisma.category.findFirst({
    where: { category: "Общее" },
  });
  if (existing) return existing.id;
  const created = await prisma.category.create({ data: { category: "Общее" } });
  return created.id;
}

/** Проверка: источник принадлежит текущему пользователю */
async function getOwnedSource(id: string, ownerId: string) {
  const source = await prisma.source.findUnique({ where: { id } });
  if (!source || source.ownerId !== ownerId) {
    throw new Error("Нет доступа к источнику");
  }
  return source;
}

export async function createSource(data: unknown) {
  const session = await requireAuth();
  const parsed = sourceFormSchema.parse(data);
  const categoryId = await getDefaultCategoryId();

  await prisma.source.create({
    data: {
      ownerId: session.user.id,
      categoryId,
      title: parsed.title,
      content: parsed.content,
      visibility: parsed.isPublic ? "PUBLIC" : "PRIVATE",
      publishedAt: parsed.isPublic ? new Date() : null,
    },
  });

  revalidateDashboard();
  revalidatePath("/");
  return { ok: true };
}

export async function updateSource(id: string, data: unknown) {
  const session = await requireAuth();
  const existing = await getOwnedSource(id, session.user.id);
  const parsed = sourceFormSchema.parse(data);

  await prisma.source.update({
    where: { id },
    data: {
      title: parsed.title,
      content: parsed.content,
      visibility: parsed.isPublic ? "PUBLIC" : "PRIVATE",
      publishedAt: parsed.isPublic
        ? (existing.publishedAt ?? new Date())
        : null,
    },
  });

  revalidateDashboard();
  revalidatePath("/");
  return { ok: true };
}

export async function deleteSource(id: string) {
  const session = await requireAuth();
  await getOwnedSource(id, session.user.id);

  await prisma.source.delete({ where: { id } });
  revalidateDashboard();
  revalidatePath("/");
  return { ok: true };
}

export async function togglePublic(id: string) {
  const session = await requireAuth();
  const source = await getOwnedSource(id, session.user.id);
  const isPublic = source.visibility !== "PUBLIC";

  await prisma.source.update({
    where: { id },
    data: {
      visibility: isPublic ? "PUBLIC" : "PRIVATE",
      publishedAt: isPublic ? new Date() : null,
    },
  });

  revalidateDashboard();
  revalidatePath("/");
  return { ok: true, isPublic };
}

export async function toggleFavorite(id: string) {
  const session = await requireAuth();
  const source = await getOwnedSource(id, session.user.id);

  await prisma.source.update({
    where: { id },
    data: { isFavorite: !source.isFavorite },
  });

  revalidateDashboard();
  return { ok: true, isFavorite: !source.isFavorite };
}
