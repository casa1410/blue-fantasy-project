import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const MEDIA_BUCKET = "public-media";
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Formato no permitido. Usa JPG, PNG, WEBP o GIF.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "La imagen supera el tamano maximo de 5MB.";
  }
  return null;
}

export async function uploadImageFile(file: File, folder: string) {
  const supabase = createSupabaseAdminClient();
  const extension = file.name.split(".").pop() || "bin";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    throw new Error(`Error subiendo imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

export async function deleteImageFile(path: string) {
  const supabase = createSupabaseAdminClient();
  await supabase.storage.from(MEDIA_BUCKET).remove([path]);
}
