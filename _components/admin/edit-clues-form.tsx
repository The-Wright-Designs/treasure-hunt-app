"use client";

import { useEffect, useState, useActionState } from "react";
import classNames from "classnames";
import { Plus, Trash2 } from "lucide-react";
import ButtonType from "@/_components/ui/buttons/button-type";
import { updateHuntClues } from "@/_actions/admin-actions";

interface Props {
  huntId: string;
  clues: string[];
  onClose: () => void;
  onSaved: () => void;
  cssClasses?: string;
}

const EditCluesForm = ({
  huntId,
  clues,
  onClose,
  onSaved,
  cssClasses,
}: Props) => {
  const [values, setValues] = useState<string[]>(clues);
  const [state, formAction] = useActionState(updateHuntClues, {
    success: false,
  });

  useEffect(() => {
    if (state.success) onSaved();
  }, [state, onSaved]);

  const updateClue = (index: number, value: string) => {
    setValues((prev) => prev.map((clue, i) => (i === index ? value : clue)));
  };

  const removeClue = (index: number) => {
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  const canSubmit = values.some((clue) => clue.trim() !== "");

  return (
    <form
      action={formAction}
      className={classNames("flex flex-col gap-[6px] w-full", cssClasses)}
    >
      <input type="hidden" name="huntId" value={huntId} />

      {values.map((clue, index) => (
        <div key={index} className="flex gap-2 items-start">
          <textarea
            name="clue"
            rows={3}
            value={clue}
            onChange={(e) => updateClue(index, e.target.value)}
            placeholder={`Clue ${index + 1}`}
            aria-label={`Clue ${index + 1}`}
            className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none"
          />
          {values.length > 1 && (
            <button
              type="button"
              onClick={() => removeClue(index)}
              aria-label={`Remove clue ${index + 1}`}
              className="border border-black/50 rounded-[6px] p-2 shrink-0 desktop:hover:cursor-pointer"
            >
              <Trash2 size={16} color="#DC2626" />
            </button>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={() => setValues((prev) => [...prev, ""])}
        className="flex gap-1 items-center self-start mt-1 desktop:hover:cursor-pointer"
      >
        <Plus size={16} color="#4B9DA9" />
        <span className="text-subheading">Add clue</span>
      </button>

      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <div className="flex gap-2 items-center mt-1.5">
        <ButtonType
          colorTeal
          disabled={!canSubmit}
          cssClasses="desktop:hover:cursor-pointer"
        >
          Save clues
        </ButtonType>

        <ButtonType
          type="button"
          colorGrey
          onClick={onClose}
          cssClasses="desktop:hover:cursor-pointer"
        >
          Cancel
        </ButtonType>
      </div>
    </form>
  );
};

export default EditCluesForm;
