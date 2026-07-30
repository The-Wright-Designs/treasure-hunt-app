"use client";

import { useActionState } from "react";
import classNames from "classnames";
import ButtonType from "@/_components/ui/buttons/button-type";
import { joinHunt } from "@/_actions/active-hunt-actions";

interface Props {
  huntId: string;
  cssClasses?: string;
}

const JoinHuntButton = ({ huntId, cssClasses }: Props) => {
  const [state, formAction] = useActionState(joinHunt, { success: false });

  return (
    <form
      action={formAction}
      className={classNames("flex flex-col gap-5", cssClasses)}
    >
      <input type="hidden" name="huntId" value={huntId} />

      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType colorTeal cssClasses="w-full desktop:hover:cursor-pointer">
        Join the hunt
      </ButtonType>
    </form>
  );
};

export default JoinHuntButton;
