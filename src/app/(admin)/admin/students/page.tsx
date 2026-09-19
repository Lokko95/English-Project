import { ConfirmDeleteForm } from "@/app/(admin)/admin/confirm-delete-form";
import { CreateUserForm } from "@/app/(admin)/admin/create-user-form";
import { ResetPasswordForm } from "@/app/(admin)/admin/reset-password-form";
import {
  assignStudentGroup,
  createStudent,
  deleteUser,
  resetUserPassword,
  updateProfileName,
} from "@/app/(admin)/admin/users-actions";
import { getAuthEmailMap, requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { Group, Profile, Student } from "@/lib/types";

export default async function AdminStudentsPage() {
  await requireAdmin();
  const supabase = await createClient();

  const [{ data: profilesData }, { data: studentsData }, { data: groupsData }, emails] = await Promise.all([
    supabase.from("profiles").select("id, full_name, role, created_at").eq("role", "STUDENT").order("full_name"),
    supabase.from("students").select("id, group_id"),
    supabase.from("groups").select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id").order("name"),
    getAuthEmailMap(),
  ]);

  const profiles = (profilesData as Profile[]) ?? [];
  const students = (studentsData as Student[]) ?? [];
  const groups = (groupsData as Group[]) ?? [];
  const groupById = new Map(groups.map((group) => [group.id, group]));
  const studentById = new Map(students.map((student) => [student.id, student]));

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="nb-heading-1">Студенты</h1>
        <p className="mt-1 text-muted">Один студент — максимум одна группа.</p>
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Новый студент</h2>
        <CreateUserForm
          action={createStudent}
          submitLabel="Создать студента"
          extraFields={
            <div className="nb-label flex flex-col gap-1.5">
              <label htmlFor="group_id">Группа (необязательно)</label>
              <select id="group_id" name="group_id" className="nb-input" defaultValue="">
                <option value="">Без группы</option>
                {groups.map((group) => (
                  <option key={group.id} value={group.id}>
                    {group.name} ({group.level})
                  </option>
                ))}
              </select>
            </div>
          }
        />
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Список</h2>
        {profiles.length === 0 ? (
          <p className="text-muted">Пока нет студентов.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {profiles.map((profile) => {
              const student = studentById.get(profile.id);
              const group = student?.group_id ? groupById.get(student.group_id) : null;
              return (
                <li key={profile.id} className="nb-card">
                  <p className="font-bold text-ink">{profile.full_name}</p>
                  <p className="text-sm text-muted break-all">{emails.get(profile.id) || "email неизвестен"}</p>
                  <p className="mt-1">
                    {group ? (
                      <span className="nb-badge nb-badge-primary">
                        {group.name} ({group.level})
                      </span>
                    ) : (
                      <span className="nb-badge nb-badge-muted">Без группы</span>
                    )}
                  </p>

                  <form action={updateProfileName.bind(null, profile.id)} className="mt-3 flex flex-wrap gap-2">
                    <input
                      name="full_name"
                      defaultValue={profile.full_name}
                      required
                      className="nb-input nb-input-sm flex-1 sm:max-w-xs"
                    />
                    <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                      Сохранить имя
                    </button>
                  </form>

                  <form action={assignStudentGroup.bind(null, profile.id)} className="mt-2 flex flex-wrap gap-2">
                    <select
                      name="group_id"
                      defaultValue={student?.group_id ?? ""}
                      className="nb-input nb-input-sm flex-1 sm:max-w-xs"
                    >
                      <option value="">Без группы</option>
                      {groups.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                      Назначить группу
                    </button>
                  </form>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <ResetPasswordForm action={resetUserPassword.bind(null, profile.id)} />
                    <ConfirmDeleteForm
                      action={deleteUser.bind(null, profile.id)}
                      message={`Удалить студента ${profile.full_name}?`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
