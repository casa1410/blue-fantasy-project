import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { prisma } from "@/lib/prisma";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Uso: npx tsx scripts/invite-admin.ts correo@ejemplo.com");
    process.exit(1);
  }

  const redirectTo =
    process.env.ADMIN_INVITE_REDIRECT_URL ?? "http://localhost:3000/admin/set-password";
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo,
  });

  if (error?.message.includes("already been registered")) {
    // User already exists (e.g. a previous invite link was consumed without
    // finishing the set-password step) — send a password recovery link instead,
    // which lands on the same /admin/set-password page.
    const publicClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
    const { error: resetError } = await publicClient.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (resetError) {
      console.error(`Error reenviando a ${email}:`, resetError.message);
      process.exit(1);
    }
    console.log(`${email} ya existia. Se envio un link de recuperacion en su lugar.`);
    return;
  }

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
