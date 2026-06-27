import Link from "next/link";
import { signOut } from "@/auth";
import { requireAuth } from "@/lib/auth/session";

export default async function DashboardPage() {
  const session = await requireAuth();

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/" });
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="logo">BoSore</h1>
        <p className="subtitle">Личный кабинет</p>
      </header>

      <section className="auth-card">
        <h2 className="auth-title">Здравствуйте, {session.user.name ?? "пользователь"}</h2>
        <p className="auth-text">
          Email: {session.user.email}
          <br />
          User ID: <code>{session.user.id}</code>
        </p>

        <div className="auth-actions">
          <Link className="auth-link-btn" href="/my-prompts">
            Мои источники
          </Link>
          <Link className="auth-link-btn auth-link-btn-secondary" href="/">
            На главную
          </Link>
          <form action={logout}>
            <button type="submit" className="auth-btn auth-btn-logout">
              Выйти
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
