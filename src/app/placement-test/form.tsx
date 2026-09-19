"use client";

import { useActionState } from "react";

import { scorePlacementTest, type PlacementResultState } from "./actions";
import type { PublicPlacementQuestion } from "@/lib/types";

export function PlacementTestForm({ questions }: { questions: PublicPlacementQuestion[] }) {
  const [state, formAction, pending] = useActionState(scorePlacementTest, {} as PlacementResultState);

  if (state.level && state.total != null && state.correct != null) {
    return (
      <section className="nb-card-highlight flex flex-col gap-4">
        <h2 className="nb-heading-1">Ориентировочный уровень: {state.level}</h2>
        <p className="text-ink">
          Верных ответов: {state.correct} из {state.total}
        </p>
        <p className="text-sm text-muted">
          Результат никуда не сохраняется и не создаёт аккаунт. Это только подсказка для администратора
          при распределении в группу.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="nb-btn nb-btn-secondary w-full sm:w-fit"
        >
          Пройти ещё раз
        </button>
      </section>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      {questions.map((question, index) => (
        <fieldset key={question.id} className="nb-card-flat">
          <legend className="nb-badge nb-badge-primary mb-2">Вопрос {index + 1}</legend>
          <p className="font-bold text-ink">{question.question}</p>
          <div className="mt-3 flex flex-col gap-2">
            {question.choices.map((choice, choiceIndex) => (
              <label
                key={choiceIndex}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border-2 border-transparent px-2 text-ink transition hover:border-ink/20 has-[:checked]:border-ink has-[:checked]:bg-primary/20"
              >
                <input type="radio" name={question.id} value={choiceIndex} required className="h-4 w-4 accent-ink" />
                {choice}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      {state.error && <p className="nb-callout-danger">{state.error}</p>}

      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary w-full sm:w-fit">
        {pending ? "Считаем..." : "Показать уровень"}
      </button>
    </form>
  );
}
