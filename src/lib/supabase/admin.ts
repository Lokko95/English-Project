import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Обходит RLS. Допустимо только для Admin Auth API (создание и отключение
 * пользователей). Обычные операции идут через сессию пользователя.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Нет NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY в окружении");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
