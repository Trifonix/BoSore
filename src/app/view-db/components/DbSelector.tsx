"use client";

import { useState } from "react";
import type { DbTarget } from "@/lib/view-db/config";

type Props = {
  initialTarget: DbTarget;
  onConnected: () => void;
};

export function DbSelector({ initialTarget, onConnected }: Props) {
  const [target, setTarget] = useState<DbTarget>(initialTarget);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function connect() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await fetch("/view-db/api/target", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Ошибка подключения");
      }

      setMessage(
        target === "local"
          ? "Подключено к локальной БД (DATABASE_URL)"
          : "Подключено к рабочей БД (DATABASE_URL_PROD)",
      );
      onConnected();
    } catch (connectError) {
      setError(
        connectError instanceof Error
          ? connectError.message
          : "Ошибка подключения",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="vdb-panel">
      <h2>Выбор базы данных</h2>
      <div className="vdb-targets">
        <label className="vdb-target">
          <input
            type="radio"
            name="db-target"
            value="local"
            checked={target === "local"}
            onChange={() => setTarget("local")}
          />
          Локальная (DATABASE_URL)
        </label>
        <label className="vdb-target">
          <input
            type="radio"
            name="db-target"
            value="prod"
            checked={target === "prod"}
            onChange={() => setTarget("prod")}
          />
          Рабочая (DATABASE_URL_PROD)
        </label>
      </div>
      <div className="vdb-actions">
        <button
          type="button"
          className="vdb-btn vdb-btn-primary"
          onClick={connect}
          disabled={loading}
        >
          {loading ? "Подключение (до 15 с)..." : "Подключиться"}
        </button>
      </div>
      {message && <p className="vdb-status">{message}</p>}
      {error && (
        <p className="vdb-status vdb-status-error" style={{ whiteSpace: "pre-line" }}>
          {error}
        </p>
      )}
    </section>
  );
}
