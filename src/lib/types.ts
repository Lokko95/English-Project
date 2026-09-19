// Минимальные типы под наши таблицы. Без генерации через `supabase gen types`
// (нет привязанного проекта в CLI) — типизируем вручную только то, что читаем/пишем.

export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}

export type GroupLevel = "A1" | "A2" | "B1" | "B2";

export interface Lesson {
  id: string;
  group_id: string;
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
  level: GroupLevel;
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

export interface StudentNote {
  id: string;
  student_id: string;
  author_id: string | null;
  body: string;
  created_at: string;
}

export interface Attendance {
  id: string;
  student_id: string;
  group_id: string;
  attended_on: string;
  present: boolean;
}

export interface PlacementQuestion {
  id: string;
  order_index: number;
  question: string;
  options: {
    choices: string[];
    correct: number;
  };
  level_hint: GroupLevel | null;
}

export type PublicPlacementQuestion = {
  id: string;
  order_index: number;
  question: string;
  choices: string[];
};
