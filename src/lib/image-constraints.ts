// Pure constants/logic, safe to import from both client and server code
// (unlike lib/storage.ts, which pulls in the Supabase admin client).

// Vercel's serverless functions hard-cap request bodies at 4.5MB regardless of
// Next.js's own bodySizeLimit config, so this must stay safely under that.
export const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Formato no permitido. Usa JPG, PNG, WEBP o GIF.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "La imagen supera el tamano maximo de 4MB. Comprimela o achica su resolucion antes de subirla.";
  }
  return null;
}
