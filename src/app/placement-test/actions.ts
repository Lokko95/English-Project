"use server";

import { createClient } from "@/lib/supabase/server";
import { suggestPlacementLevel } from "@/lib/placement";
import type { GroupLevel } from "@/lib/types";

export interface PlacementResultState {
  error?: string;
  correct?: number;
  total?: number;
  level?: GroupLevel;
}

function answersFromForm(formData: FormData): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value !== "string" || value === "" || !/^[0-9]+$/.test(value)) continue;
    answers[key] = Number(value);
  }
  return answers;
}

export async function scorePlacementTest(
  _prev: PlacementResultState | undefined,
  formData: FormData,
): Promise<PlacementResultState> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("grade_placement_answers", {
    p_answers: answersFromForm(formData),
  });

  if (error) {
    return { error: error.message };
  }

  const rows = ((data ?? []) as { level: string | null; is_correct: boolean }[]).map((row) => ({
    level: (row.level as GroupLevel | null) ?? null,
    correct: Boolean(row.is_correct),
  }));

  if (rows.length === 0) {
    return { error: "Вопросы теста ещё не загружены" };
  }

  return {
    correct: rows.filter((row) => row.correct).length,
    total: rows.length,
    level: suggestPlacementLevel(rows),
  };
}
