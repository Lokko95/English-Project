"use client";

import { useActionState } from "react";

import { updateFullName, type ProfileFormState } from "./actions";

const initialState: ProfileFormState = {};

export function UpdateNameForm({ currentName }: { currentName: string }) {
  const [state, formAction, pending] = useActionState(updateFullName, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div className="nb-label flex flex-col gap-1.5">
        <label htmlFor="full_name">Имя</label>
        <input id="full_name" name="full_name" defaultValue={currentName} required className="nb-input" />
      </div>

      {state?.error && <p className="nb-callout-danger">{state.error}</p>}
      {state?.success && <p className="nb-callout-success">Сохранено</p>}

      <button type="submit" disabled={pending} className="nb-btn nb-btn-primary w-full sm:w-fit">
        {pending ? "Сохраняем..." : "Сохранить имя"}
      </button>
    </form>
  );
}
