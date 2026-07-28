"use client";

import classNames from "classnames";
import { useActionState } from "react";
import ButtonType from "@/_components/ui/buttons/button-type";
import { closeHuntNow } from "@/_actions/admin-actions";

interface Props {
  huntId: string;
  cssClasses?: string;
}

const CloseHuntButton = ({ huntId, cssClasses }: Props) => {
  const [state, formAction] = useActionState(
    async () => closeHuntNow(huntId),
    { success: false } as { success: boolean; error?: string },
  );

  return (
    <form
      action={formAction}
      className={classNames("flex flex-col gap-1.5 items-start", cssClasses)}
    >
      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType colorOrange cssClasses="desktop:hover:cursor-pointer">
        Close hunt now
      </ButtonType>
    </form>
  );
};

export default CloseHuntButton;
