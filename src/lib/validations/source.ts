import { z } from "zod";

export const sourceFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Укажите заголовок")
    .max(200, "Не более 200 символов"),
  content: z
    .string()
    .trim()
    .min(1, "Укажите содержание")
    .max(10000, "Не более 10000 символов"),
  isPublic: z.boolean(),
});

export type SourceFormValues = z.infer<typeof sourceFormSchema>;

export const PAGE_SIZE = 10;
