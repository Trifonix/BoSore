import Link from "next/link";
import { auth } from "@/auth";
import { formatDisplayName } from "@/lib/format-name";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/UserMenu";

const NAV = [
  { href: "/", label: "Главная" },
  { href: "/catalog", label: "Каталог" },
  { href: "/dashboard", label: "Мои источники" },
];

export async function Header() {
  const session = await auth();
  const user = session?.user;

  return (
    <header className="site-header site-chrome-root">
      <div className="site-header-inner">
        <Link href="/" className="site-brand">
          BoSore
        </Link>

        <nav className="site-header-nav" aria-label="Основная навигация">
          {NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="site-header-link">
              {label}
            </Link>
          ))}
        </nav>

        <div className="site-header-actions">
          {user?.id ? (
            <UserMenu
              userName={formatDisplayName(user.name, user.email)}
              userImage={user.image}
            />
          ) : (
            <Button asChild size="sm">
              <Link href="/login">Войти</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
