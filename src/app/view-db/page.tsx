import { ViewDbHome } from "./ViewDbHome";
import { getDbTargetFromCookie } from "@/lib/view-db/target";

export default async function ViewDbPage() {
  const initialTarget = await getDbTargetFromCookie();

  return (
    <div className="vdb-wrap">
      <header className="vdb-header">
        <h1 className="vdb-title">view-db</h1>
        <p className="vdb-subtitle">
          Тестовый просмотр таблиц PostgreSQL с выбором локальной или рабочей БД
        </p>
      </header>
      <ViewDbHome initialTarget={initialTarget} />
    </div>
  );
}
