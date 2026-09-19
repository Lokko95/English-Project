import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmDeleteForm } from "@/app/(admin)/admin/confirm-delete-form";
import {
  addStudentToGroup,
  deleteGroup,
  removeStudentFromGroup,
  updateGroup,
} from "@/app/(admin)/admin/groups/actions";
import { requireAdmin } from "@/lib/dal/admin";
import { createClient } from "@/lib/supabase/server";
import type { Group, Lesson, Profile, Student } from "@/lib/types";

export default async function AdminGroupDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireAdmin();
  const supabase = await createClient();

  const { data: groupData } = await supabase
    .from("groups")
    .select("id, name, level, teacher_id, meeting_url, evening_time, current_lesson_id")
    .eq("id", id)
    .maybeSingle();

  if (!groupData) {
    notFound();
  }
  const group = groupData as Group;

  const [{ data: teachersData }, { data: lessonsData }, { data: membersData }, { data: allStudentsData }, { data: profilesData }] =
    await Promise.all([
      supabase.from("profiles").select("id, full_name, role, created_at").eq("role", "TEACHER").order("full_name"),
      supabase
        .from("lessons")
        .select("id, group_id, order_index, title, grammar_title, grammar_body, materials, created_at")
        .eq("group_id", id)
        .order("order_index"),
      supabase.from("students").select("id, group_id").eq("group_id", id),
      supabase.from("students").select("id, group_id"),
      supabase.from("profiles").select("id, full_name, role, created_at").eq("role", "STUDENT").order("full_name"),
    ]);

  const teachers = (teachersData as Profile[]) ?? [];
  const lessons = (lessonsData as Lesson[]) ?? [];
  const members = (membersData as Student[]) ?? [];
  const allStudents = (allStudentsData as Student[]) ?? [];
  const studentProfiles = (profilesData as Profile[]) ?? [];
  const profileById = new Map(studentProfiles.map((profile) => [profile.id, profile]));

  const memberIds = new Set(members.map((member) => member.id));
  const availableStudents = allStudents.filter((student) => student.group_id !== id);

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="mb-1">
          <Link href="/admin/groups" className="nb-breadcrumb">
            Группы
          </Link>
        </p>
        <h1 className="nb-heading-1">{group.name}</h1>
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Параметры</h2>
        <form action={updateGroup.bind(null, group.id)} className="nb-card flex flex-col gap-3">
          <input name="name" required defaultValue={group.name} className="nb-input" />
          <select name="level" required defaultValue={group.level} className="nb-input">
            <option value="A1">A1</option>
            <option value="A2">A2</option>
            <option value="B1">B1</option>
            <option value="B2">B2</option>
          </select>
          <select name="teacher_id" defaultValue={group.teacher_id ?? ""} className="nb-input">
            <option value="">Без преподавателя</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.full_name}
              </option>
            ))}
          </select>
          <input
            name="evening_time"
            defaultValue={group.evening_time ?? ""}
            placeholder="Время урока"
            className="nb-input"
          />
          <input
            name="meeting_url"
            type="url"
            defaultValue={group.meeting_url ?? ""}
            placeholder="Ссылка на встречу"
            className="nb-input"
          />
          <select name="current_lesson_id" defaultValue={group.current_lesson_id ?? ""} className="nb-input">
            <option value="">Текущий урок не назначен</option>
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.order_index}. {lesson.title}
              </option>
            ))}
          </select>
          <button type="submit" className="nb-btn nb-btn-primary w-full sm:w-fit">
            Сохранить
          </button>
        </form>
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Уроки этой группы</h2>
        {lessons.length === 0 ? (
          <p className="text-muted">Уроков нет — группа создаётся пустой.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/admin/lessons/${lesson.id}`} className="nb-link">
                  {lesson.order_index}. {lesson.title}
                  {lesson.id === group.current_lesson_id ? " — текущий" : ""}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <Link
          href={`/admin/lessons/new?group_id=${group.id}`}
          className="nb-btn nb-btn-secondary nb-btn-sm mt-3 w-full sm:w-fit"
        >
          Добавить урок
        </Link>
      </section>

      <section>
        <h2 className="nb-heading-2 mb-3">Состав</h2>
        {members.length === 0 ? (
          <p className="text-muted">Студентов нет.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {members.map((member) => (
              <li key={member.id} className="nb-card-flat flex items-center justify-between gap-3">
                <span className="text-ink">{profileById.get(member.id)?.full_name ?? member.id}</span>
                <ConfirmDeleteForm
                  action={removeStudentFromGroup.bind(null, group.id, member.id)}
                  label="Убрать"
                  message="Убрать студента из группы?"
                />
              </li>
            ))}
          </ul>
        )}

        {availableStudents.length > 0 && (
          <form action={addStudentToGroup.bind(null, group.id)} className="mt-3 flex flex-wrap gap-2">
            <select name="student_id" required defaultValue="" className="nb-input flex-1 sm:max-w-xs">
              <option value="" disabled>
                Добавить студента
              </option>
              {availableStudents.map((student) => {
                const inOther = student.group_id && !memberIds.has(student.id);
                const name = profileById.get(student.id)?.full_name ?? student.id;
                return (
                  <option key={student.id} value={student.id}>
                    {name}
                    {inOther ? " (переместить из другой группы)" : ""}
                  </option>
                );
              })}
            </select>
            <button type="submit" className="nb-btn nb-btn-secondary">
              Добавить
            </button>
          </form>
        )}
      </section>

      <section>
        <ConfirmDeleteForm
          action={deleteGroup.bind(null, group.id)}
          label="Удалить группу"
          message="Удалить группу вместе с её уроками?"
        />
      </section>
    </div>
  );
}
