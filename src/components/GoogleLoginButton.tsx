"use client";

import { useEffect, useState } from "react";

type Props = {
  callbackUrl: string;
};

/**
 * Auth.js требует POST /api/auth/signin/google с CSRF-токеном.
 * GET или signIn() из server action ломают OAuth (PKCE / Configuration).
 */
export function GoogleLoginButton({ callbackUrl }: Props) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/auth/csrf")
      .then((response) => response.json())
      .then((data: { csrfToken: string }) => setCsrfToken(data.csrfToken))
      .catch(() => setCsrfToken(null));
  }, []);

  if (!csrfToken) {
    return (
      <button type="button" className="auth-btn auth-btn-google" disabled>
        Загрузка...
      </button>
    );
  }

  return (
    <form action="/api/auth/signin/google" method="POST">
      <input type="hidden" name="csrfToken" value={csrfToken} />
      <input type="hidden" name="callbackUrl" value={callbackUrl} />
      <button type="submit" className="auth-btn auth-btn-google">
        Войти через Google
      </button>
    </form>
  );
}
