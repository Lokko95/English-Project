import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/session";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("STUDENT");

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard" className="text-gray-700 hover:text-gray-900">
              Дашборд
            </Link>
            <Link href="/words" className="text-gray-700 hover:text-gray-900">
              Все слова
            </Link>
            <Link href="/profile" className="text-gray-700 hover:text-gray-900">
              Профиль
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span>{profile.full_name}</span>
            <form action={logout}>
              <button type="submit" className="text-gray-700 underline hover:text-gray-900">
                Выйти
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
