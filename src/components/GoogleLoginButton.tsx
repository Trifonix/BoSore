"use client";

import { signIn } from "next-auth/react";

type Props = {
  callbackUrl: string;
};

/** Client-side OAuth: корректно сохраняет PKCE cookie для callback */
export function GoogleLoginButton({ callbackUrl }: Props) {
  return (
    <button
      type="button"
      className="auth-btn auth-btn-google"
      onClick={() => signIn("google", { callbackUrl })}
    >
      Войти через Google
    </button>
  );
}
