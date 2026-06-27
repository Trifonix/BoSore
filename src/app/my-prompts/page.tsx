import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ownerSourcesFilter } from "@/lib/auth/access";
import { requireAuth } from "@/lib/auth/session";

export default async function MyPromptsPage() {
  const session = await requireAuth();

  // Владелец видит все свои источники, включая PRIVATE
  const sources = await prisma.source.findMany({
    where: ownerSourcesFilter(session.user.id),
    orderBy: { updatedAt: "desc" },
    include: {
      category: true,
      _count: { select: { votes: true } },
    },
  });

  return (
    <div className="page">
      <header className="header">
        <h1 className="logo">BoSore</h1>
        <p className="subtitle">Мои источники</p>
        <span className="badge">
          <span className="badge-dot" />
          {sources.length}{" "}
          {sources.length === 1
            ? "источник"
            : sources.length < 5
              ? "источника"
              : "источников"}
        </span>
      </header>

      <div className="auth-actions" style={{ marginBottom: "1.5rem" }}>
        <Link className="auth-link-btn auth-link-btn-secondary" href="/dashboard">
          ← Кабинет
        </Link>
      </div>

      {sources.length === 0 ? (
        <p className="empty">
          У вас пока нет источников. Создайте первый — он будет привязан к вашему
          userId.
        </p>
      ) : (
        <ul className="list">
          {sources.map((source) => (
            <li key={source.id} className="item">
              <p className="item-summary">{source.content}</p>
              {source.description && (
                <p className="item-gost">
                  <span className="item-gost-label">По ГОСТ</span>
                  {source.description}
                </p>
              )}
              <time dateTime={source.updatedAt.toISOString()}>
                {source.category.category} · {source.visibility} ·{" "}
                {source._count.votes}{" "}
                {source._count.votes === 1 ? "голос" : "голосов"}
              </time>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
