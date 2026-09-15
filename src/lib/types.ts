// Минимальные типы под наши таблицы. Без генерации через `supabase gen types`
// (нет привязанного проекта в CLI) — типизируем вручную только то, что читаем/пишем.

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export interface Lesson {
  id: string;
  order_index: number;
  title: string;
  grammar_title: string;
  grammar_body: string;
  materials: string | null;
  created_at: string;
}

export interface VocabularyItem {
  id: string;
  lesson_id: string;
  word: string;
  translation: string;
  example: string;
  transcription: string | null;
  order_index: number;
}

export interface Group {
  id: string;
  name: string;
  teacher_id: string | null;
  meeting_url: string | null;
  evening_time: string | null;
  current_lesson_id: string | null;
}

export interface Student {
  id: string;
  group_id: string | null;
}

export type LessonProgressStatus = "IN_PROGRESS" | "COMPLETED";

export interface StudentLessonProgress {
  student_id: string;
  lesson_id: string;
  status: LessonProgressStatus;
  completed_at: string | null;
}
