"use client";

import Link from "next/link";

type Props = {
  tables: string[];
  loading: boolean;
  error: string | null;
  connected: boolean;
};

export function TableList({ tables, loading, error, connected }: Props) {
  if (!connected && !loading && !error) {
    return (
      <section className="vdb-panel">
        <h2>Таблицы</h2>
        <p className="vdb-empty">
          Выберите БД и нажмите «Подключиться», чтобы увидеть список таблиц.
        </p>
      </section>
    );
  }
  if (loading) {
    return (
      <section className="vdb-panel">
        <h2>Таблицы</h2>
        <p className="vdb-status">Загрузка списка таблиц...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="vdb-panel">
        <h2>Таблицы</h2>
        <p className="vdb-status vdb-status-error" style={{ whiteSpace: "pre-line" }}>
          {error}
        </p>
      </section>
    );
  }

  if (tables.length === 0) {
    return (
      <section className="vdb-panel">
        <h2>Таблицы</h2>
        <p className="vdb-empty">Таблицы не найдены. Сначала подключитесь к БД.</p>
      </section>
    );
  }

  return (
    <section className="vdb-panel">
      <h2>Таблицы</h2>
      <ul className="vdb-table-list">
        {tables.map((table) => (
          <li key={table} className="vdb-table-item">
            <span className="vdb-table-name">{table}</span>
            <Link className="vdb-btn vdb-btn-ghost" href={`/view-db/${table}`}>
              Открыть
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
