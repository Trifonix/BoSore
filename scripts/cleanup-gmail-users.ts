/**
 * Оставить только пользователей с @gmail.com, удалить остальных.
 * С флагом --clear-sources также удалить все источники (лайки каскадом).
 *
 *   npm run db:cleanup-gmail
 *   npm run db:cleanup-gmail -- --clear-sources
 *   npm run db:cleanup-gmail -- --dry-run --clear-sources
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const dryRun = process.argv.includes("--dry-run");
const clearSources = process.argv.includes("--clear-sources");

function isGmailEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith("@gmail.com");
}

async function main() {
  const allUsers = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      _count: { select: { sources: true, likes: true } },
    },
    orderBy: { email: "asc" },
  });

  const keep = allUsers.filter((u) => isGmailEmail(u.email));
  const remove = allUsers.filter((u) => !isGmailEmail(u.email));

  const removeSourceCount = await prisma.source.count({
    where: { ownerId: { in: remove.map((u) => u.id) } },
  });

  console.log(`Сохранить gmail-пользователей: ${keep.length}`);
  for (const u of keep) {
    console.log(
      `  + ${u.email} (${u.name ?? "—"}) — источников: ${u._count.sources}, лайков: ${u._count.likes}`,
    );
  }

  console.log(`\nУдалить пользователей: ${remove.length}`);
  for (const u of remove) {
    console.log(
      `  - ${u.email} (${u.name ?? "—"}) — источников: ${u._count.sources}`,
    );
  }
  console.log(`  (их источников всего: ${removeSourceCount})`);

  const totalSources = await prisma.source.count();
  const totalLikes = await prisma.like.count();
  if (clearSources) {
    console.log(`\nУдалить все источники: ${totalSources} (лайков: ${totalLikes})`);
  }

  if (dryRun) {
    console.log("\n--dry-run: изменения не применены.");
    return;
  }

  const ops = [];

  if (remove.length > 0) {
    ops.push(
      prisma.user.deleteMany({
        where: { id: { in: remove.map((u) => u.id) } },
      }),
    );
  }

  if (clearSources) {
    ops.push(prisma.source.deleteMany());
  }

  if (ops.length > 0) {
    ops.push(prisma.verificationToken.deleteMany());
    await prisma.$transaction(ops);
  } else if (!clearSources) {
    console.log("\nНечего удалять — только gmail-пользователи.");
    return;
  }

  const usersLeft = await prisma.user.count();
  const sourcesLeft = await prisma.source.count();

  console.log("\nOK: очистка выполнена.");
  console.log(`  пользователей: ${usersLeft}, источников: ${sourcesLeft}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
