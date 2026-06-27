-- Add isFavorite to Source (dashboard)
ALTER TABLE "Source" ADD COLUMN IF NOT EXISTS "isFavorite" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Source_ownerId_isFavorite_idx" ON "Source"("ownerId", "isFavorite");

-- Remove duplicate Prompt table (merged into Source)
DROP TABLE IF EXISTS "Prompt";
