import { TableViewer } from "../components/TableViewer";
import { isAllowedTable } from "@/lib/view-db/config";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ table: string }>;
};

export default async function ViewDbTablePage({ params }: PageProps) {
  const { table } = await params;

  if (!isAllowedTable(table)) {
    notFound();
  }

  return (
    <div className="vdb-wrap">
      <header className="vdb-header">
        <h1 className="vdb-title">view-db</h1>
      </header>
      <TableViewer table={table} />
    </div>
  );
}
