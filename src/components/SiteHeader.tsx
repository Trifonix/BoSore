import Link from "next/link";
import { auth } from "@/auth";

/** Скрываем шапку сайта внутри личного кабинета */
export async function SiteHeader() {
  const session = await auth();

  return (
    <nav className="site-nav dashboard-hidden site-header-root">
      <Link href="/">BoSore</Link>
      {session?.user ? (
        <Link href="/dashboard">Кабинет</Link>
      ) : (
        <Link href="/login">Войти</Link>
      )}
    </nav>
  );
}
