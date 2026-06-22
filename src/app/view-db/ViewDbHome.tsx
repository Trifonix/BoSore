"use client";

import { useCallback, useState } from "react";
import { DbSelector } from "./components/DbSelector";
import { TableList } from "./components/TableList";
import type { DbTarget } from "@/lib/view-db/config";

type Props = {
  initialTarget: DbTarget;
};

export function ViewDbHome({ initialTarget }: Props) {
  const [tables, setTables] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/view-db/api/tables");
      const data = (await response.json()) as {
        tables?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось загрузить таблицы");
      }

      setTables(data.tables ?? []);
      setConnected(true);
    } catch (loadError) {
      setConnected(false);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Не удалось загрузить таблицы",
      );
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <>
      <DbSelector
        initialTarget={initialTarget}
        onConnected={() => void loadTables()}
      />
      <TableList
        tables={tables}
        loading={loading}
        error={error}
        connected={connected}
      />
    </>
  );
}
