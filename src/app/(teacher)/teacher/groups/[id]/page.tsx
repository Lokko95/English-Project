import Link from "next/link";

import { requireTeacherGroup, todayInMoscow } from "@/lib/dal/teacher";
import { createClient } from "@/lib/supabase/server";
import type {
  Attendance,
  Lesson,
  LessonProgressStatus,
  Profile,
  StudentNote,
} from "@/lib/types";

import { addStudentNote, setAttendance } from "./actions";

export default async function TeacherGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const group = await requireTeacherGroup(id);
  const supabase = await createClient();
  const today = todayInMoscow();

  const { data: studentsData } = await supabase.from("students").select("id").eq("group_id", id);
  const studentIds = (studentsData ?? []).map((row) => row.id as string);

  const { data: lessonsData } = await supabase
    .from("lessons")
    .select("id, group_id, order_index, title, grammar_title, grammar_body, materials, created_at")
    .eq("group_id", id)
    .order("order_index");
  const lessons = (lessonsData as Lesson[]) ?? [];
  const currentLesson = lessons.find((lesson) => lesson.id === group.current_lesson_id) ?? null;

  let profiles: Profile[] = [];
  let progressRows: { student_id: string; lesson_id: string; status: LessonProgressStatus }[] = [];
  let attendanceRows: Attendance[] = [];
  let notes: StudentNote[] = [];

  if (studentIds.length > 0) {
    const [{ data: profilesData }, { data: progressData }, { data: attendanceData }, { data: notesData }] =
      await Promise.all([
        supabase.from("profiles").select("id, full_name, role, created_at").in("id", studentIds),
        supabase.from("student_lesson_progress").select("student_id, lesson_id, status").in("student_id", studentIds),
        supabase.from("attendance").select("id, student_id, group_id, attended_on, present").eq("group_id", id).eq("attended_on", today),
        supabase
          .from("student_notes")
          .select("id, student_id, author_id, body, created_at")
          .in("student_id", studentIds)
          .order("created_at", { ascending: false }),
      ]);

    profiles = (profilesData as Profile[]) ?? [];
    progressRows = (progressData as typeof progressRows) ?? [];
    attendanceRows = (attendanceData as Attendance[]) ?? [];
    notes = (notesData as StudentNote[]) ?? [];
  }

  const attendanceByStudent = new Map(attendanceRows.map((row) => [row.student_id, row]));
  const notesByStudent = new Map<string, StudentNote[]>();
  for (const note of notes) {
    const list = notesByStudent.get(note.student_id) ?? [];
    list.push(note);
    notesByStudent.set(note.student_id, list);
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <p className="mb-1">
          <Link href="/teacher" className="nb-breadcrumb">
            Мои группы
          </Link>
        </p>
        <h1 className="nb-heading-1">
          {group.name} <span className="font-normal text-muted">({group.level})</span>
        </h1>
        {group.evening_time && <p className="mt-1 text-ink">Время: {group.evening_time}</p>}
        {group.meeting_url && (
          <a href={group.meeting_url} target="_blank" rel="noreferrer" className="nb-link">
            Ссылка на онлайн-урок
          </a>
        )}
        {currentLesson ? (
          <p className="mt-2 text-ink">
            Текущий урок:{" "}
            <Link href={`/teacher/lessons/${currentLesson.id}`} className="nb-link">
              {currentLesson.order_index}. {currentLesson.title}
            </Link>
          </p>
        ) : (
          <p className="mt-2 text-muted">Текущий урок не назначен</p>
        )}
      </section>

      <section>
        <h2 className="nb-heading-2">Уроки группы</h2>
        {lessons.length === 0 ? (
          <p className="mt-2 text-muted">Уроков пока нет.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-2">
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link href={`/teacher/lessons/${lesson.id}`} className="nb-link">
                  {lesson.order_index}. {lesson.title}
                  {lesson.id === group.current_lesson_id ? " — текущий" : ""}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="nb-heading-2">Студенты</h2>
        <p className="mt-1 text-sm text-muted">Посещаемость за сегодня ({today})</p>
        {profiles.length === 0 ? (
          <p className="mt-2 text-muted">В группе пока нет студентов.</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-4">
            {profiles.map((profile) => {
              const completedCount = progressRows.filter(
                (row) => row.student_id === profile.id && row.status === "COMPLETED",
              ).length;
              const preparedCurrent = Boolean(
                currentLesson &&
                  progressRows.some(
                    (row) =>
                      row.student_id === profile.id &&
                      row.lesson_id === currentLesson.id &&
                      row.status === "COMPLETED",
                  ),
              );
              const attendance = attendanceByStudent.get(profile.id);
              const studentNotes = notesByStudent.get(profile.id) ?? [];

              return (
                <li key={profile.id} className="nb-card">
                  <div className="flex flex-col gap-1">
                    <h3 className="nb-heading-3">{profile.full_name}</h3>
                    <p className="flex flex-wrap items-center gap-2 text-sm text-muted">
                      <span>Подготовлено уроков: {completedCount}</span>
                      {currentLesson &&
                        (preparedCurrent ? (
                          <span className="nb-badge nb-badge-success">К уроку готов</span>
                        ) : (
                          <span className="nb-badge nb-badge-warning">К уроку не готов</span>
                        ))}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="nb-badge nb-badge-muted">
                      Сегодня: {attendance == null ? "не отмечен" : attendance.present ? "был" : "не был"}
                    </span>
                    <form action={setAttendance.bind(null, profile.id, group.id, true)}>
                      <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                        Был
                      </button>
                    </form>
                    <form action={setAttendance.bind(null, profile.id, group.id, false)}>
                      <button type="submit" className="nb-btn nb-btn-secondary nb-btn-sm">
                        Не был
                      </button>
                    </form>
                  </div>

                  <div className="mt-4">
                    <h4 className="nb-heading-3">Заметки</h4>
                    {studentNotes.length === 0 ? (
                      <p className="mt-1 text-sm text-muted">Пока нет</p>
                    ) : (
                      <ul className="mt-1 flex flex-col gap-1">
                        {studentNotes.map((note) => (
                          <li key={note.id} className="text-sm text-ink">
                            <span className="text-muted">{new Date(note.created_at).toLocaleString("ru-RU")}</span>
                            {" — "}
                            {note.body}
                          </li>
                        ))}
                      </ul>
                    )}
                    <form
                      action={addStudentNote.bind(null, profile.id, group.id)}
                      className="mt-2 flex flex-col gap-2 sm:flex-row"
                    >
                      <textarea
                        name="body"
                        required
                        rows={2}
                        placeholder="Заметка преподавателя"
                        className="nb-input nb-input-sm flex-1"
                      />
                      <button type="submit" className="nb-btn nb-btn-primary nb-btn-sm">
                        Добавить заметку
                      </button>
                    </form>
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
