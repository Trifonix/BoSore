import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  isAuthenticated: boolean;
};

export function HomeHero({ isAuthenticated }: Props) {
  return (
    <section className="home-hero">
      <h1 className="logo">BoSore</h1>
      <p className="subtitle home-hero-subtitle">
        Books Sources Store — описания книг и статей с оформлением по ГОСТ для
        списка литературы
      </p>
      <div className="home-hero-actions">
        {isAuthenticated ? (
          <Button asChild>
            <Link href="/dashboard">Добавить источник</Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link href="/login?callbackUrl=/dashboard">Добавить источник</Link>
            </Button>
            <p className="home-hero-hint">Войдите, чтобы добавлять источники</p>
          </>
        )}
      </div>
    </section>
  );
}
