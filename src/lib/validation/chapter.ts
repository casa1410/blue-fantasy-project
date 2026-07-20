import { z } from "zod";

export const chapterSchema = z.object({
  title: z.string().trim().min(1, "El titulo es obligatorio").max(200),
  content: z.string().trim().min(1, "El capitulo no puede estar vacio"),
  footer: z.string().trim().max(3000, "El pie de pagina es demasiado largo").optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

export type ChapterFormValues = z.infer<typeof chapterSchema>;
