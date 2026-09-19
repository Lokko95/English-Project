import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireRole } from "@/lib/auth/session";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireRole("STUDENT");

  return (
    <div className="min-h-screen">
      <header className="nb-header">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-sm font-bold text-primary">Студент</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden font-semibold text-paper/90 sm:inline">{profile.full_name}</span>
            <form action={logout}>
              <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                Выйти
              </button>
            </form>
          </div>
          <nav className="flex w-full flex-wrap gap-1.5">
            <Link href="/dashboard" className="nb-nav-link">
              Дашборд
            </Link>
            <Link href="/words" className="nb-nav-link">
              Все слова
            </Link>
            <Link href="/profile" className="nb-nav-link">
              Профиль
            </Link>
          </nav>
        </div>
      </header>
      <main className="nb-container py-6 sm:py-8">{children}</main>
    </div>
  );
}
