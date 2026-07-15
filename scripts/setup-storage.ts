import "dotenv/config";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

const BUCKET = "public-media";

async function main() {
  const supabase = createSupabaseAdminClient();

  const { data: buckets, error: listError } = await supabase.storage.listBuckets();
  if (listError) {
    console.error("Error listando buckets:", listError.message);
    process.exit(1);
  }

  if (buckets.some((b) => b.name === BUCKET)) {
    console.log(`El bucket "${BUCKET}" ya existe.`);
    return;
  }

  const { error } = await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: "5MB",
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  });

  if (error) {
    console.error("Error creando bucket:", error.message);
    process.exit(1);
  }

  console.log(`Bucket "${BUCKET}" creado correctamente (publico, max 5MB, solo imagenes).`);
}

main();
