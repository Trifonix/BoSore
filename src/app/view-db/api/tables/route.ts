import { NextResponse } from "next/server";
import { getViewDbClient } from "@/lib/view-db/client";
import { formatDbError } from "@/lib/view-db/errors";
import { isViewDbEnabled } from "@/lib/view-db/guard";
import { listPublicTables } from "@/lib/view-db/operations";
import { getDbTargetFromCookie } from "@/lib/view-db/target";

export async function GET() {
  if (!isViewDbEnabled()) {
    return NextResponse.json({ error: "view-db отключён" }, { status: 404 });
  }

  try {
    const target = await getDbTargetFromCookie();
    const prisma = getViewDbClient(target);
    const tables = await listPublicTables(prisma);

    return NextResponse.json({ target, tables });
  } catch (error) {
    return NextResponse.json({ error: formatDbError(error) }, { status: 500 });
  }
}
