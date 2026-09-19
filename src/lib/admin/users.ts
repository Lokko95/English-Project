import "server-only";

import { randomBytes } from "crypto";

import { requireAdmin } from "@/lib/dal/admin";
import { createAdminClient } from "@/lib/supabase/admin";

export function generateTempPassword(): string {
  return randomBytes(12).toString("base64url");
}

export async function createAuthUser(input: {
  email: string;
  fullName: string;
  role: "STUDENT" | "TEACHER";
}): Promise<{ userId: string; email: string; password: string } | { error: string }> {
  await requireAdmin();

  const password = generateTempPassword();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password,
    email_confirm: true,
    user_metadata: {
      role: input.role,
      full_name: input.fullName,
    },
  });

  if (error || !data.user) {
    return { error: error?.message ?? "Не удалось создать пользователя" };
  }

  return { userId: data.user.id, email: input.email, password };
}

export async function deleteAuthUser(userId: string): Promise<{ error?: string }> {
  const { userId: adminId } = await requireAdmin();
  if (userId === adminId) {
    return { error: "Нельзя удалить собственный аккаунт" };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) {
    return { error: error.message };
  }
  return {};
}

export async function resetAuthPassword(
  userId: string,
): Promise<{ password: string } | { error: string }> {
  await requireAdmin();
  const password = generateTempPassword();
  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, { password });
  if (error) {
    return { error: error.message };
  }
  return { password };
}
