import Link from "next/link";
import { auth } from "@/auth";

/** Навигация с учётом server-side сессии */
export async function SiteHeader() {
  const session = await auth();

  return (
    <nav className="site-nav">
      <Link href="/">BoSore</Link>
      {session?.user ? (
        <>
          <Link href="/dashboard">Кабинет</Link>
          <Link href="/my-prompts">Мои источники</Link>
        </>
      ) : (
        <Link href="/login">Войти</Link>
      )}
    </nav>
  );
}
