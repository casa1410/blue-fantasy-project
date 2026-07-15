"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getSiteUrl } from "@/lib/site-url";

const MIN_ADMINS = 2;
const emailSchema = z.string().trim().email("Correo invalido");

export async function inviteAdmin(email: string) {
  await requireAdminUser();
  const parsedEmail = emailSchema.parse(email);

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(parsedEmail, {
    redirectTo: `${getSiteUrl()}/admin/set-password`,
  });

  if (error) {
    throw new Error(error.message);
  }

  await prisma.adminProfile.upsert({
    where: { email: parsedEmail },
    update: {},
    create: { id: data.user.id, email: parsedEmail, role: "admin" },
  });

  revalidatePath("/admin/admins");
}

export async function removeAdmin(id: string) {
  const currentUser = await requireAdminUser();

  const total = await prisma.adminProfile.count();
  if (total <= MIN_ADMINS) {
    throw new Error(
      `Debe haber al menos ${MIN_ADMINS} administradores. Agrega otro antes de eliminar este.`,
    );
  }

  if (id === currentUser.id) {
    throw new Error("No puedes eliminar tu propia cuenta de administrador.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.auth.admin.deleteUser(id);
  if (error) {
    throw new Error(error.message);
  }

  await prisma.adminProfile.delete({ where: { id } });
  revalidatePath("/admin/admins");
}
