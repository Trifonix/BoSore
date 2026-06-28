import { prisma } from "@/lib/prisma";
import { PAGE_SIZE } from "@/lib/validations/source";
import type { Prisma, Visibility } from "@prisma/client";

export type SourceSort = "recent" | "popular";

export type SourceDTO = {
  id: string;
  ownerId: string;
  title: string;
  content: string;
  isPublic: boolean;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
  ownerName: string | null;
  likesCount?: number;
  likedByMe?: boolean;
};

export type SourceListResult = {
  items: SourceDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

function searchFilter(q: string): Prisma.SourceWhereInput {
  if (!q.trim()) return {};
  return {
    OR: [
      { title: { contains: q, mode: "insensitive" } },
      { content: { contains: q, mode: "insensitive" } },
    ],
  };
}

function mapSource(
  source: {
    id: string;
    ownerId: string;
    title: string;
    content: string;
    visibility: Visibility;
    isFavorite: boolean;
    createdAt: Date;
    updatedAt: Date;
    owner: { name: string | null };
  },
): SourceDTO {
  return {
    id: source.id,
    ownerId: source.ownerId,
    title: source.title,
    content: source.content,
    isPublic: source.visibility === "PUBLIC",
    isFavorite: source.isFavorite,
    createdAt: source.createdAt,
    updatedAt: source.updatedAt,
    ownerName: source.owner.name,
  };
}

export async function getMySources(
  ownerId: string,
  page = 1,
  q = "",
): Promise<SourceListResult> {
  const where: Prisma.SourceWhereInput = {
    ownerId,
    ...searchFilter(q),
  };

  const skip = (page - 1) * PAGE_SIZE;
  const [items, total] = await Promise.all([
    prisma.source.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { owner: { select: { name: true } } },
    }),
    prisma.source.count({ where }),
  ]);

  return {
    items: items.map(mapSource),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getFavoriteSources(
  ownerId: string,
  page = 1,
  q = "",
): Promise<SourceListResult> {
  const where: Prisma.SourceWhereInput = {
    ownerId,
    isFavorite: true,
    ...searchFilter(q),
  };

  const skip = (page - 1) * PAGE_SIZE;
  const [items, total] = await Promise.all([
    prisma.source.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: { owner: { select: { name: true } } },
    }),
    prisma.source.count({ where }),
  ]);

  return {
    items: items.map(mapSource),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

export async function getPublicSources(
  page = 1,
  q = "",
  sort: SourceSort = "recent",
  currentUserId?: string | null,
): Promise<SourceListResult> {
  const where: Prisma.SourceWhereInput = {
    visibility: "PUBLIC",
    ...searchFilter(q),
  };

  const orderBy: Prisma.SourceOrderByWithRelationInput =
    sort === "popular"
      ? { likes: { _count: "desc" } }
      : { createdAt: "desc" };

  const skip = (page - 1) * PAGE_SIZE;
  const [items, total] = await Promise.all([
    prisma.source.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        owner: { select: { name: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.source.count({ where }),
  ]);

  let likedSourceIds = new Set<string>();

  if (currentUserId && items.length > 0) {
    const likes = await prisma.like.findMany({
      where: {
        userId: currentUserId,
        sourceId: { in: items.map((item) => item.id) },
      },
      select: { sourceId: true },
    });
    likedSourceIds = new Set(likes.map((like) => like.sourceId));
  }

  return {
    items: items.map((source) => ({
      ...mapSource(source),
      likesCount: source._count.likes,
      likedByMe: likedSourceIds.has(source.id),
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}
