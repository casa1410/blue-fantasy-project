import { z } from "zod";

export const novelSchema = z.object({
  title: z.string().trim().min(1, "El titulo es obligatorio").max(200),
  synopsis: z.string().trim().min(1, "La sinopsis es obligatoria").max(5000),
  genre: z.string().trim().max(100).optional().or(z.literal("")),
  tags: z.string().trim().max(300).optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type NovelFormValues = z.infer<typeof novelSchema>;
