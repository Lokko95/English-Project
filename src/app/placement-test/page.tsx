import Link from "next/link";

import { PlacementTestForm } from "./form";
import { createClient } from "@/lib/supabase/server";
import type { PublicPlacementQuestion } from "@/lib/types";

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    return null;
  }
  return value;
}

export default async function PlacementTestPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_placement_questions_public");

  if (error) {
    return (
      <main className="nb-container flex min-h-screen flex-col gap-6 py-12">
        <h1 className="nb-heading-1">Тест на уровень</h1>
        <p className="nb-callout-danger">Не удалось загрузить вопросы.</p>
      </main>
    );
  }

  const questions: PublicPlacementQuestion[] = (data ?? [])
    .map((row: { id: unknown; order_index: unknown; question: unknown; choices: unknown }) => {
      const choices = asStringArray(row.choices);
      if (!choices) return null;
      return {
        id: row.id as string,
        order_index: row.order_index as number,
        question: row.question as string,
        choices,
      };
    })
    .filter((row: PublicPlacementQuestion | null): row is PublicPlacementQuestion => row !== null);

  return (
    <main className="nb-container flex min-h-screen flex-col gap-8 py-8 sm:py-12">
      <section>
        <p className="mb-2">
          <Link href="/" className="nb-breadcrumb">
            На главную
          </Link>
        </p>
        <h1 className="nb-heading-1">Тест на определение уровня</h1>
        <p className="mt-2 text-muted">
          Без регистрации. Ответы не сохраняются, аккаунт не создаётся. Выберите один вариант в каждом
          вопросе.
        </p>
      </section>

      {questions.length === 0 ? (
        <p className="text-muted">Вопросы ещё не добавлены.</p>
      ) : (
        <PlacementTestForm questions={questions} />
      )}
    </main>
  );
}
