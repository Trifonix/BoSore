"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { RecordModal } from "./RecordModal";

type Column = {
  name: string;
  dataType: string;
  isNullable: boolean;
  hasDefault: boolean;
};

type TableResponse = {
  target: string;
  table: string;
  columns: Column[];
  rows: Record<string, unknown>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  readOnly: boolean;
  error?: string;
};

type ModalState =
  | { mode: "create" }
  | { mode: "edit"; row: Record<string, unknown> }
  | null;

type Props = {
  table: string;
};

export function TableViewer({ table }: Props) {
  const [data, setData] = useState<TableResponse | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/view-db/api/${encodeURIComponent(table)}?page=${page}`,
      );
      const json = (await response.json()) as TableResponse & { error?: string };

      if (!response.ok) {
        throw new Error(json.error ?? "Ошибка загрузки таблицы");
      }

      setData(json);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "Ошибка загрузки",
      );
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [page, table]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleSave(values: Record<string, unknown>) {
    setActionError(null);

    const isEdit = modal?.mode === "edit";
    const id = isEdit ? String(modal.row.id) : null;
    const url = isEdit
      ? `/view-db/api/${encodeURIComponent(table)}/${encodeURIComponent(id!)}`
      : `/view-db/api/${encodeURIComponent(table)}`;

    const response = await fetch(url, {
      method: isEdit ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      throw new Error(json.error ?? "Ошибка сохранения");
    }

    setModal(null);
    await load();
  }

  async function handleDelete(row: Record<string, unknown>) {
    const id = String(row.id);
    if (!window.confirm(`Удалить запись ${id}?`)) {
      return;
    }

    setActionError(null);
    const response = await fetch(
      `/view-db/api/${encodeURIComponent(table)}/${encodeURIComponent(id)}`,
      { method: "DELETE" },
    );
    const json = (await response.json()) as { error?: string };

    if (!response.ok) {
      setActionError(json.error ?? "Ошибка удаления");
      return;
    }

    await load();
  }

  const columns = data?.columns ?? [];
  const rows = data?.rows ?? [];

  return (
    <div>
      <div className="vdb-breadcrumb">
        <Link href="/view-db">view-db</Link>
        <span>/</span>
        <span>{table}</span>
        {data && (
          <>
            <span>·</span>
            <span>{data.target === "prod" ? "рабочая БД" : "локальная БД"}</span>
          </>
        )}
      </div>

      <div className="vdb-toolbar">
        <h2 style={{ margin: 0 }}>{table}</h2>
        <div className="vdb-actions">
          <Link className="vdb-btn vdb-btn-secondary" href="/view-db">
            Назад
          </Link>
          {!data?.readOnly && (
            <button
              type="button"
              className="vdb-btn vdb-btn-primary"
              onClick={() => setModal({ mode: "create" })}
            >
              Создать
            </button>
          )}
        </div>
      </div>

      {loading && <p className="vdb-status">Загрузка данных...</p>}
      {error && <p className="vdb-status vdb-status-error">{error}</p>}
      {actionError && (
        <p className="vdb-status vdb-status-error">{actionError}</p>
      )}

      {!loading && !error && data && (
        <>
          <div className="vdb-table-wrap">
            <table className="vdb-table">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column.name}>{column.name}</th>
                  ))}
                  {!data.readOnly && <th>Действия</th>}
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + (data.readOnly ? 0 : 1)}>
                      Записей нет
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={String(row.id ?? JSON.stringify(row))}>
                      {columns.map((column) => (
                        <td key={column.name}>
                          {formatCell(row[column.name])}
                        </td>
                      ))}
                      {!data.readOnly && (
                        <td>
                          <div className="vdb-row-actions">
                            <button
                              type="button"
                              className="vdb-btn vdb-btn-secondary"
                              onClick={() =>
                                setModal({ mode: "edit", row })
                              }
                            >
                              Изменить
                            </button>
                            <button
                              type="button"
                              className="vdb-btn vdb-btn-danger"
                              onClick={() => void handleDelete(row)}
                            >
                              Удалить
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="vdb-pagination">
            <span>
              Страница {data.page} из {data.totalPages} · всего {data.total}
            </span>
            <div className="vdb-actions">
              <button
                type="button"
                className="vdb-btn vdb-btn-secondary"
                disabled={data.page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
              >
                Назад
              </button>
              <button
                type="button"
                className="vdb-btn vdb-btn-secondary"
                disabled={data.page >= data.totalPages}
                onClick={() => setPage((current) => current + 1)}
              >
                Вперёд
              </button>
            </div>
          </div>
        </>
      )}

      {modal && (
        <RecordModal
          mode={modal.mode}
          columns={columns}
          initialValues={modal.mode === "edit" ? modal.row : undefined}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function formatCell(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
