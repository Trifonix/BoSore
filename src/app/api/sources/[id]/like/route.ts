import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_request: Request, context: RouteContext) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Войдите, чтобы ставить лайки" },
      { status: 401 },
    );
  }

  const { id: sourceId } = await context.params;
  const userId = session.user.id;

  try {
    const source = await prisma.source.findUnique({
      where: { id: sourceId },
      select: { id: true, visibility: true },
    });

    if (!source || source.visibility !== "PUBLIC") {
      return NextResponse.json({ error: "Источник не найден" }, { status: 404 });
    }

    const existing = await prisma.like.findUnique({
      where: { userId_sourceId: { userId, sourceId } },
      select: { id: true },
    });

    let liked: boolean;

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      liked = false;
    } else {
      await prisma.like.create({ data: { userId, sourceId } });
      liked = true;
    }

    const likesCount = await prisma.like.count({ where: { sourceId } });

    return NextResponse.json({ liked, likesCount });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      const likesCount = await prisma.like.count({ where: { sourceId } });
      return NextResponse.json({ liked: true, likesCount });
    }

    console.error("[POST /api/sources/[id]/like]", error);
    return NextResponse.json({ error: "Попробуйте позже" }, { status: 503 });
  }
}
