import { z } from "zod";

export const commentSchema = z.object({
  authorName: z.string().trim().min(1, "Tu nombre es obligatorio").max(100),
  authorEmail: z.string().trim().email("Correo invalido").max(200),
  body: z
    .string()
    .trim()
    .min(1, "El comentario no puede estar vacio")
    .max(3000, "El comentario es demasiado largo"),
});

export type CommentFormValues = z.infer<typeof commentSchema>;
