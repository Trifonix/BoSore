import { notFound } from "next/navigation";
import { isViewDbEnabled } from "@/lib/view-db/guard";
import "./view-db.css";

export default function ViewDbLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isViewDbEnabled()) {
    notFound();
  }

  return <div className="vdb-root">{children}</div>;
}
