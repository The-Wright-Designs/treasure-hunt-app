"use client";

import classNames from "classnames";
import { useActionState } from "react";
import ButtonType from "@/_components/ui/buttons/button-type";
import { deleteQueuedHunt } from "@/_actions/admin-actions";

interface Props {
  huntId: string;
  cssClasses?: string;
}

const DeleteHuntButton = ({ huntId, cssClasses }: Props) => {
  const [state, formAction] = useActionState(
    async () => {
      if (!window.confirm("Delete this queued hunt? This cannot be undone.")) {
        return { success: false } as { success: boolean; error?: string };
      }
      return deleteQueuedHunt(huntId);
    },
    { success: false } as { success: boolean; error?: string },
  );

  return (
    <form
      action={formAction}
      className={classNames("flex flex-col gap-1.5 items-start", cssClasses)}
    >
      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType colorOrange cssClasses="desktop:hover:cursor-pointer">
        Delete hunt
      </ButtonType>
    </form>
  );
};

export default DeleteHuntButton;
