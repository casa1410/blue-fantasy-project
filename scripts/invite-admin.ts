import "dotenv/config";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/invite-admin.ts correo@ejemplo.com");
    process.exit(1);
  }

  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) {
    console.error(`Error invitando a ${email}:`, error.message);
    process.exit(1);
  }

  await prisma.adminProfile.upsert({
    where: { email },
    update: {},
    create: { id: data.user.id, email, role: "admin" },
  });

  console.log(`Invitacion enviada a ${email}. Revisa tu correo para definir la contrasena.`);
  await prisma.$disconnect();
}

main();
