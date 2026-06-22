"use client";

import { useState } from "react";

type Column = {
  name: string;
  dataType: string;
  isNullable: boolean;
  hasDefault: boolean;
};

type Props = {
  mode: "create" | "edit";
  columns: Column[];
  initialValues?: Record<string, unknown>;
  onClose: () => void;
  onSave: (values: Record<string, unknown>) => Promise<void>;
};

export function RecordModal({
  mode,
  columns,
  initialValues,
  onClose,
  onSave,
}: Props) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    buildInitialValues(columns, initialValues, mode),
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const editableColumns = columns.filter((column) => {
    if (mode === "create" && column.name === "id" && column.hasDefault) {
      return false;
    }
    if (column.name === "updatedAt") {
      return false;
    }
    if (mode === "edit" && column.name === "id") {
      return false;
    }
    return true;
  });

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload: Record<string, unknown> = {};
      for (const column of editableColumns) {
        payload[column.name] = values[column.name] ?? "";
      }
      if (mode === "edit" && initialValues?.id) {
        payload.id = initialValues.id;
      }
      await onSave(payload);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "Ошибка сохранения",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="vdb-modal-backdrop" onClick={onClose}>
      <div className="vdb-modal" onClick={(event) => event.stopPropagation()}>
        <h3>{mode === "create" ? "Создать запись" : "Изменить запись"}</h3>
        <form className="vdb-form" onSubmit={(event) => void submit(event)}>
          {editableColumns.map((column) => (
            <div className="vdb-field" key={column.name}>
              <label htmlFor={column.name}>
                {column.name}
                {!column.isNullable && mode === "create" ? " *" : ""}
              </label>
              {renderInput(column, values[column.name] ?? "", (next) =>
                setValues((current) => ({ ...current, [column.name]: next })),
              )}
            </div>
          ))}
          {error && <p className="vdb-status vdb-status-error">{error}</p>}
          <div className="vdb-modal-actions">
            <button
              type="button"
              className="vdb-btn vdb-btn-secondary"
              onClick={onClose}
            >
              Отмена
            </button>
            <button
              type="submit"
              className="vdb-btn vdb-btn-primary"
              disabled={saving}
            >
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildInitialValues(
  columns: Column[],
  initialValues: Record<string, unknown> | undefined,
  mode: "create" | "edit",
): Record<string, string> {
  const result: Record<string, string> = {};

  for (const column of columns) {
    const raw = initialValues?.[column.name];
    if (mode === "edit" && raw !== undefined && raw !== null) {
      result[column.name] = String(raw);
      continue;
    }

    if (column.name === "visibility") {
      result[column.name] = "PRIVATE";
    } else if (column.name === "value") {
      result[column.name] = "1";
    } else {
      result[column.name] = "";
    }
  }

  return result;
}

function renderInput(
  column: Column,
  value: string,
  onChange: (value: string) => void,
) {
  if (column.name === "visibility") {
    return (
      <select id={column.name} value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="PRIVATE">PRIVATE</option>
        <option value="PUBLIC">PUBLIC</option>
      </select>
    );
  }

  if (
    column.dataType.includes("text") ||
    column.name === "content" ||
    column.name === "description"
  ) {
    return (
      <textarea
        id={column.name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  return (
    <input
      id={column.name}
      type={column.dataType.includes("timestamp") ? "datetime-local" : "text"}
      value={toInputDate(value, column.dataType)}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function toInputDate(value: string, dataType: string): string {
  if (!dataType.includes("timestamp") || !value) {
    return value;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
