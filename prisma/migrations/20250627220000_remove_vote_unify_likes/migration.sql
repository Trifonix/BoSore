-- Перенос старых голосов (Vote) в лайки (Like), затем удаление Vote
INSERT INTO "Like" ("id", "userId", "sourceId", "createdAt")
SELECT 'vote_' || "id", "userId", "sourceId", "createdAt"
FROM "Vote"
ON CONFLICT ("userId", "sourceId") DO NOTHING;

DROP TABLE "Vote";
