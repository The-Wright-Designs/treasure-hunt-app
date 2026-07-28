import Link from "next/link";
import { ActiveHuntAdminView } from "@/_types/past-hunt-types";
import { formatDeadlineLabel } from "@/_lib/utils/format-deadline";
import { getFirestoreConsoleUrl } from "@/_lib/utils/firestore-console-url";

interface Props {
  hunt: ActiveHuntAdminView | null;
}

const ActiveHuntSummary = ({ hunt }: Props) => {
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
        </div>
      )}
    </div>
  );
};

export default ActiveHuntSummary;
