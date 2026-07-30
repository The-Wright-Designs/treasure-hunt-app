"use client";

import { useState, useActionState } from "react";
import classNames from "classnames";
import { PartyPopper } from "lucide-react";
import TextInput from "@/_components/ui/inputs/text-input";
import ButtonType from "@/_components/ui/buttons/button-type";
import { submitHuntEntry } from "@/_actions/active-hunt-actions";

interface Props {
  huntId: string;
  entered: boolean;
  cssClasses?: string;
}

const HuntEntryForm = ({ huntId, entered, cssClasses }: Props) => {
  const [entryCode, setEntryCode] = useState("");
  const [state, formAction] = useActionState(submitHuntEntry, {
    success: false,
  });

  if (entered || state.success) {
    return (
      <div
        className={classNames(
          "flex gap-5 items-center px-5 py-7 bg-teal rounded-[6px]",
          cssClasses,
        )}
      >
        <PartyPopper size={50} color="#FFFFFF" className="shrink-0" />
        <div className="flex flex-col gap-1">
          <p className="text-subheading text-[20px] text-white">
            Congratulations!
          </p>
          <p className="text-white">
            You&apos;ve completed the hunt, and are now in this week&apos;s draw
            — we&apos;ll be in touch if you win.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className={classNames("flex flex-col gap-5", cssClasses)}
    >
      <input type="hidden" name="huntId" value={huntId} />

      <TextInput
        label="Found the item? Enter the code on it"
        name="entryCode"
        required
        placeholder="TEAL-4471"
        autoComplete="off"
        value={entryCode}
        onChange={(e) => setEntryCode(e.target.value)}
      />

      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType
        colorTeal
        disabled={entryCode.trim() === ""}
        cssClasses="self-start desktop:hover:cursor-pointer"
      >
        Submit entry
      </ButtonType>
    </form>
  );
};

export default HuntEntryForm;
