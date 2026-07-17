import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export { validateImageFile } from "@/lib/image-constraints";

export const MEDIA_BUCKET = "public-media";

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
