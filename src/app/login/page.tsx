import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  const { callbackUrl } = await searchParams;

  // Уже авторизован — в личный кабинет
  if (session?.user) {
    redirect("/dashboard");
  }

  async function loginWithGoogle() {
    "use server";
    await signIn("google", {
      redirectTo: callbackUrl ?? "/dashboard",
    });
  }

  return (
    <div className="page">
      <header className="header">
        <h1 className="logo">BoSore</h1>
        <p className="subtitle">Вход в сервис источников для списка литературы</p>
      </header>

      <section className="auth-card">
        <h2 className="auth-title">Вход</h2>
        <p className="auth-text">
          Авторизуйтесь через Google. При первом входе аккаунт будет создан
          автоматически.
        </p>
        <form action={loginWithGoogle}>
          <button type="submit" className="auth-btn auth-btn-google">
            Войти через Google
          </button>
        </form>
      </section>
    </div>
  );
}
