// Pure constants/logic, safe to import from both client and server code
// (unlike lib/storage.ts, which pulls in the Supabase admin client).

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Formato no permitido. Usa JPG, PNG, WEBP o GIF.";
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return "La imagen supera el tamano maximo de 5MB. Comprimela o achica su resolucion antes de subirla.";
  }
  return null;
}
