"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ClosedHuntAdminView } from "@/_types/past-hunt-types";
import { formatDeadlineLabel } from "@/_lib/utils/format-deadline";
import { getFirestoreConsoleUrl } from "@/_lib/utils/firestore-console-url";
import ButtonType from "@/_components/ui/buttons/button-type";
import { resendHuntEmail } from "@/_actions/admin-actions";

interface Props {
  hunts: ClosedHuntAdminView[];
  cssClasses?: string;
}

const ResendForm = ({ huntId }: { huntId: string }) => {
  const [state, formAction] = useActionState(
    async () => resendHuntEmail(huntId),
    { success: false } as { success: boolean; error?: string },
  );

  return (
    <form action={formAction} className="flex flex-col gap-1.5 items-start">
      {state.error && <p className="text-error text-[12px]">{state.error}</p>}

      <ButtonType colorTeal cssClasses="desktop:hover:cursor-pointer">
        Resend email
      </ButtonType>
    </form>
  );
};

const HuntAttentionList = ({ hunts, cssClasses }: Props) => {
  if (hunts.length === 0) return null;

  return (
    <div className={cssClasses}>
      <div className="flex flex-col gap-5">
        <h3>Needs Attention</h3>

        <p>
          These hunts closed but the owner email never sent. The hourly cron
          retries automatically — resend here if it keeps failing.
        </p>

        <ul className="flex flex-col gap-3">
          {hunts.map((hunt) => (
            <li
              key={hunt.id}
              className="flex flex-col gap-1.5 border border-error rounded-[6px] px-3 py-2"
            >
              <p className="text-subheading">
                Closed{" "}
                {hunt.closedAt
                  ? formatDeadlineLabel(hunt.closedAt)
                  : formatDeadlineLabel(hunt.deadline)}
              </p>
              <p>
                {hunt.completedCount} completed &middot; winner:{" "}
                {hunt.winner ?? "none"}
              </p>
              <p>
                Firestore ID:{" "}
                <Link
                  href={getFirestoreConsoleUrl(hunt.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link underline"
                >
                  {hunt.id}
                </Link>
              </p>

              <ResendForm huntId={hunt.id} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default HuntAttentionList;
