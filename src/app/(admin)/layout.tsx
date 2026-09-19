import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireAdmin } from "@/lib/dal/admin";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireAdmin();

  return (
    <div className="min-h-screen">
      <header className="nb-header">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-sm font-bold text-primary">Админ</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden font-semibold text-paper/90 sm:inline">{profile.full_name}</span>
            <form action={logout}>
              <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                Выйти
              </button>
            </form>
          </div>
          <nav className="flex w-full flex-wrap gap-1.5">
            <Link href="/admin" className="nb-nav-link">
              Обзор
            </Link>
            <Link href="/admin/students" className="nb-nav-link">
              Студенты
            </Link>
            <Link href="/admin/teachers" className="nb-nav-link">
              Преподаватели
            </Link>
            <Link href="/admin/groups" className="nb-nav-link">
              Группы
            </Link>
            <Link href="/admin/lessons" className="nb-nav-link">
              Уроки
            </Link>
          </nav>
        </div>
      </header>
      <main className="nb-container-wide py-6 sm:py-8">{children}</main>
    </div>
  );
}
