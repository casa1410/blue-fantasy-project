import "dotenv/config";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { generateTempPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/set-temp-password.ts correo@ejemplo.com");
    process.exit(1);
  }

  const admin = await prisma.adminProfile.findUnique({ where: { email } });
  if (!admin) {
    console.error(`No hay un AdminProfile con ese correo: ${email}`);
    process.exit(1);
  }

  const password = generateTempPassword();
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(admin.id, { password });

  if (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }

  console.log(`Contrasena temporal para ${email}: ${password}`);
  await prisma.$disconnect();
}

main();
