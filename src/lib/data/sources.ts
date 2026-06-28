import { prisma } from "@/lib/prisma";
import { publicSourcesFilter, readableSourceFilter } from "@/lib/auth/access";
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
  tags?: { id: string; name: string }[];
};

export type SourceListResult = {
  items: SourceDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type PublicSourceFeedItem = {
  id: string;
  content: string;
  description: string | null;
  createdAt: Date;
  likesCount: number;
  likedByMe: boolean;
};

export type PublicSourceCardItem = {
  id: string;
  title: string;
  content: string;
  description: string | null;
  createdAt: Date;
  ownerId: string;
  ownerName: string | null;
  tags: { id: string; name: string }[];
  likesCount: number;
  likedByMe: boolean;
};

export const HOME_SECTION_LIMIT = 12;

const publicSourceInclude = {
  owner: { select: { name: true } },
  tags: { select: { id: true, name: true } },
  _count: { select: { likes: true } },
} as const;

function mapPublicSourceCard(
  source: {
    id: string;
    title: string;
    content: string;
    description: string | null;
    createdAt: Date;
    ownerId: string;
    owner: { name: string | null };
    tags: { id: string; name: string }[];
    _count: { likes: number };
  },
  likedSourceIds: Set<string>,
): PublicSourceCardItem {
  return {
    id: source.id,
    title: source.title,
    content: source.content,
    description: source.description,
    createdAt: source.createdAt,
    ownerId: source.ownerId,
    ownerName: source.owner.name,
    tags: source.tags,
    likesCount: source._count.likes,
    likedByMe: likedSourceIds.has(source.id),
  };
}

async function getLikedSourceIds(
  userId: string,
  sourceIds: string[],
): Promise<Set<string>> {
  if (sourceIds.length === 0) return new Set();

  const likes = await prisma.like.findMany({
    where: { userId, sourceId: { in: sourceIds } },
    select: { sourceId: true },
  });

  return new Set(likes.map((like) => like.sourceId));
}

function publicSourcesOrderBy(
  sort: SourceSort,
): Prisma.SourceOrderByWithRelationInput {
  return sort === "popular"
    ? { likes: { _count: "desc" } }
    : { createdAt: "desc" };
}

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
    ...publicSourcesFilter,
    ...searchFilter(q),
  };

  const orderBy = publicSourcesOrderBy(sort);

  const skip = (page - 1) * PAGE_SIZE;
  const [items, total] = await Promise.all([
    prisma.source.findMany({
      where,
      orderBy,
      skip,
      take: PAGE_SIZE,
      include: {
        owner: { select: { name: true } },
        tags: { select: { id: true, name: true } },
        _count: { select: { likes: true } },
      },
    }),
    prisma.source.count({ where }),
  ]);

  let likedSourceIds = new Set<string>();

  if (currentUserId && items.length > 0) {
    likedSourceIds = await getLikedSourceIds(
      currentUserId,
      items.map((item) => item.id),
    );
  }

  return {
    items: items.map((source) => ({
      ...mapSource(source),
      likesCount: source._count.likes,
      likedByMe: likedSourceIds.has(source.id),
      tags: source.tags,
    })),
    total,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
  };
}

/** Две выборки для главной: новые и популярные */
export async function getHomePageSources(
  currentUserId?: string | null,
  limit = HOME_SECTION_LIMIT,
): Promise<{ recent: PublicSourceCardItem[]; popular: PublicSourceCardItem[] }> {
  const [recentRaw, popularRaw] = await Promise.all([
    prisma.source.findMany({
      where: publicSourcesFilter,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: publicSourceInclude,
    }),
    prisma.source.findMany({
      where: publicSourcesFilter,
      orderBy: { likes: { _count: "desc" } },
      take: limit,
      include: publicSourceInclude,
    }),
  ]);

  const allIds = [...new Set([...recentRaw, ...popularRaw].map((s) => s.id))];
  const likedSourceIds = currentUserId
    ? await getLikedSourceIds(currentUserId, allIds)
    : new Set<string>();

  return {
    recent: recentRaw.map((s) => mapPublicSourceCard(s, likedSourceIds)),
    popular: popularRaw.map((s) => mapPublicSourceCard(s, likedSourceIds)),
  };
}

/** Публичный источник по id (или свой приватный для владельца) */
export async function getPublicSourceById(
  sourceId: string,
  currentUserId?: string | null,
): Promise<PublicSourceCardItem | null> {
  const source = await prisma.source.findFirst({
    where: readableSourceFilter(sourceId, currentUserId),
    include: publicSourceInclude,
  });

  if (!source) return null;

  const likedSourceIds = currentUserId
    ? await getLikedSourceIds(currentUserId, [source.id])
    : new Set<string>();

  return mapPublicSourceCard(source, likedSourceIds);
}

/** Публичная лента для главной страницы (сортировка по лайкам) — legacy */
export async function getPublicSourcesFeed(
  currentUserId?: string | null,
): Promise<PublicSourceFeedItem[]> {
  const items = await prisma.source.findMany({
    where: publicSourcesFilter,
    orderBy: publicSourcesOrderBy("popular"),
    include: { _count: { select: { likes: true } } },
  });

  const likedSourceIds = currentUserId
    ? await getLikedSourceIds(
        currentUserId,
        items.map((item) => item.id),
      )
    : new Set<string>();

  return items.map((source) => ({
    id: source.id,
    content: source.content,
    description: source.description,
    createdAt: source.createdAt,
    likesCount: source._count.likes,
    likedByMe: likedSourceIds.has(source.id),
  }));
}
