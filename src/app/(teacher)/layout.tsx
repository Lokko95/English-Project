import Link from "next/link";

import { logout } from "@/lib/auth/actions";
import { requireTeacher } from "@/lib/dal/teacher";

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireTeacher();

  return (
    <div className="min-h-screen">
      <header className="nb-header">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <span className="text-sm font-bold text-primary">Преподаватель</span>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden font-semibold text-paper/90 sm:inline">{profile.full_name}</span>
            <form action={logout}>
              <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                Выйти
              </button>
            </form>
          </div>
          <nav className="flex w-full flex-wrap gap-1.5">
            <Link href="/teacher" className="nb-nav-link">
              Мои группы
            </Link>
          </nav>
        </div>
      </header>
      <main className="nb-container py-6 sm:py-8">{children}</main>
    </div>
  );
}
