import { z } from "zod";

export const sourceFormSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, "Укажите описание")
    .max(10000, "Не более 10000 символов"),
  description: z
    .string()
    .trim()
    .max(2000, "Не более 2000 символов"),
  isPublic: z.boolean(),
});

export type SourceFormValues = z.infer<typeof sourceFormSchema>;

export const PAGE_SIZE = 10;

/** Служебный title в БД — из первой части строки по ГОСТ или описания */
export function deriveSourceTitle(description: string, content: string): string {
  const fromGost = description.trim().split(/[/.—]/)[0]?.trim();
  if (fromGost && fromGost.length >= 3) {
    return fromGost.slice(0, 200);
  }
  const fromContent = content.trim().slice(0, 80);
  return fromContent || "Источник";
}
