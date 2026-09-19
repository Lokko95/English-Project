import "server-only";

import { requireRole } from "@/lib/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireAdmin() {
  return requireRole("ADMIN");
}

/** Email лежит в Auth, не в profiles. listUsers — Admin Auth API, не обход RLS таблиц. */
export async function getAuthEmailMap(): Promise<Map<string, string>> {
  await requireAdmin();
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });

  if (error) {
    throw new Error(`Не удалось прочитать пользователей Auth: ${error.message}`);
  }

  return new Map((data.users ?? []).map((user) => [user.id, user.email ?? ""]));
}
