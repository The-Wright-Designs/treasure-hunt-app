import Link from "next/link";
import { ActiveHuntAdminView } from "@/_types/past-hunt-types";
import { formatDeadlineLabel } from "@/_lib/utils/format-deadline";
import { getFirestoreConsoleUrl } from "@/_lib/utils/firestore-console-url";
import CloseHuntButton from "@/_components/admin/close-hunt-button";

interface Props {
  hunt: ActiveHuntAdminView | null;
}

const ActiveHuntSummary = ({ hunt }: Props) => {
  const overdue = !!hunt && hunt.deadline <= new Date().toISOString();

  return (
    <div className="flex flex-col gap-5">
      <h3>Active Hunt</h3>

      {!hunt ? (
        <p>No hunt is currently live.</p>
      ) : (
        <div className="flex flex-col gap-1.5 border border-black/50 rounded-[6px] px-3 py-2">
          <p className="text-subheading">
            Started {formatDeadlineLabel(hunt.startsAt)}
          </p>
          <p>Closes {formatDeadlineLabel(hunt.deadline)}</p>
          <p>
            R{hunt.prizeAmount} &middot; {hunt.clueCount}{" "}
            {hunt.clueCount === 1 ? "clue" : "clues"}
          </p>
          <p>
            {hunt.activeHunters}{" "}
            {hunt.activeHunters === 1 ? "hunter" : "hunters"} &middot;{" "}
            {hunt.completedCount} completed
          </p>
          <p>
            Prize location:{" "}
            {hunt.locationNote ?? `${hunt.mapLatitude}, ${hunt.mapLongitude}`}
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

          {overdue && (
            <>
              <p className="text-error">
                This hunt is past its deadline and has not closed yet.
              </p>
              <CloseHuntButton huntId={hunt.id} cssClasses="mt-1.5" />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ActiveHuntSummary;
