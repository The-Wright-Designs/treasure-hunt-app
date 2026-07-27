"use client";

import { useState, useActionState } from "react";
import { Plus, Trash2 } from "lucide-react";
import NumberInput from "@/_components/ui/inputs/number-input";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import { createHunt } from "@/_actions/admin-actions";

const HuntForm = () => {
  const [clues, setClues] = useState<string[]>([""]);
  const [state, formAction] = useActionState(createHunt, { success: false });

  const updateClue = (index: number, value: string) => {
    setClues((prev) => prev.map((clue, i) => (i === index ? value : clue)));
  };

  const removeClue = (index: number) => {
    setClues((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div className="flex flex-col gap-[6px] w-full">
        <label htmlFor="startsAt" className="text-paragraph">
          Starts at *
        </label>
        <input
          id="startsAt"
          name="startsAt"
          type="datetime-local"
          required
          className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full outline-none"
        />
      </div>

      <div className="flex flex-col gap-[6px] w-full">
        <label htmlFor="deadline" className="text-paragraph">
          Deadline *
        </label>
        <input
          id="deadline"
          name="deadline"
          type="datetime-local"
          required
          className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full outline-none"
        />
      </div>

      <NumberInput
        label="Prize amount"
        name="prizeAmount"
        required
        min={1}
        placeholder="500"
      />

      <NumberInput
        label="Map latitude"
        name="mapLatitude"
        required
        min={-90}
        max={90}
        step={0.000001}
        placeholder="-34.0527"
      />

      <NumberInput
        label="Map longitude"
        name="mapLongitude"
        required
        min={-180}
        max={180}
        step={0.000001}
        placeholder="23.3716"
      />

      <NumberInput
        label="Map zoom"
        name="mapZoom"
        required
        min={1}
        max={22}
        placeholder="15"
      />

      <TextInput
        label="Location note"
        name="locationNote"
        placeholder="Buried under the bench near the lighthouse steps"
      />

      <div className="flex flex-col gap-[6px] w-full">
        <p className="text-paragraph">Clues *</p>

        {clues.map((clue, index) => (
          <div key={index} className="flex gap-2 items-start">
            <textarea
              name="clue"
              rows={3}
              value={clue}
              onChange={(e) => updateClue(index, e.target.value)}
              placeholder={`Clue ${index + 1}`}
              className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none"
            />
            {clues.length > 1 && (
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
          onClick={() => setClues((prev) => [...prev, ""])}
          className="flex gap-1 items-center self-start mt-1 desktop:hover:cursor-pointer"
        >
          <Plus size={16} color="#4B9DA9" />
          <span className="text-subheading">Add clue</span>
        </button>
      </div>

      {state.error && (
        <p className="text-error text-[12px]">{state.error}</p>
      )}

      {state.success && (
        <p className="text-[12px]">Hunt created. It will go live at the start date.</p>
      )}

      <ButtonType colorTeal cssClasses="mt-5 desktop:hover:cursor-pointer">
        Create hunt
      </ButtonType>
    </form>
  );
};

export default HuntForm;
