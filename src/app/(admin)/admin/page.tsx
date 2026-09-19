import Link from "next/link";

import { requireAdmin } from "@/lib/dal/admin";

export default async function AdminHomePage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="nb-heading-1">Админ</h1>
        <p className="mt-1 text-muted">Аккаунты, группы и уроки. Публичной регистрации нет.</p>
      </section>
      <ul className="flex flex-col gap-3">
        <li className="nb-card-flat">
          <Link href="/admin/students" className="nb-link">
            Студенты
          </Link>
          <p className="mt-1 text-sm text-muted">Создать, назначить группу, сбросить пароль</p>
        </li>
        <li className="nb-card-flat">
          <Link href="/admin/teachers" className="nb-link">
            Преподаватели
          </Link>
          <p className="mt-1 text-sm text-muted">Создать и привязать к группам</p>
        </li>
        <li className="nb-card-flat">
          <Link href="/admin/groups" className="nb-link">
            Группы
          </Link>
          <p className="mt-1 text-sm text-muted">Пустая группа, уровень, текущий урок, состав</p>
        </li>
        <li className="nb-card-flat">
          <Link href="/admin/lessons" className="nb-link">
            Уроки
          </Link>
          <p className="mt-1 text-sm text-muted">Урок конкретной группы, не глобальный каталог</p>
        </li>
      </ul>
    </div>
  );
}
