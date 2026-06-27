import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { GoogleLoginButton } from "@/components/GoogleLoginButton";

type PageProps = {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
};

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "Ошибка конфигурации Auth.js. Проверьте AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET и AUTH_URL.",
  AccessDenied: "Доступ запрещён. Возможно, ваш email не в списке Test users.",
  OAuthSignin: "Не удалось начать вход через Google.",
  OAuthCallback: "Ошибка OAuth callback. Очистите cookies для localhost и попробуйте снова.",
  Default: "Не удалось войти. Попробуйте ещё раз.",
};

export default async function LoginPage({ searchParams }: PageProps) {
  const session = await auth();
  const { callbackUrl, error } = await searchParams;

  if (session?.user) {
    redirect("/dashboard");
  }

  const redirectTo = callbackUrl ?? "/dashboard";
  const errorMessage = error
    ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default)
    : null;

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

        {errorMessage && (
          <p className="auth-error" role="alert">
            {errorMessage}
          </p>
        )}

        <GoogleLoginButton callbackUrl={redirectTo} />
      </section>
    </div>
  );
}
