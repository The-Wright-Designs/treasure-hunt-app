import Link from "next/link";
import { QueuedHuntView } from "@/_types/past-hunt-types";
import { formatDeadlineLabel } from "@/_lib/utils/format-deadline";
import { getFirestoreConsoleUrl } from "@/_lib/utils/firestore-console-url";

interface Props {
  hunts: QueuedHuntView[];
}

const HuntQueue = ({ hunts }: Props) => {
  return (
    <div className="flex flex-col gap-5">
      <h3>Queued Hunts</h3>

      {hunts.length === 0 ? (
        <p>No hunts queued.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {hunts.map((hunt) => (
            <li
              key={hunt.id}
              className="flex flex-col gap-1.5 border border-black/50 rounded-[6px] px-3 py-2"
            >
              <p className="text-subheading">
                Starts {formatDeadlineLabel(hunt.startsAt)}
              </p>
              <p>Closes {formatDeadlineLabel(hunt.deadline)}</p>
              <p>
                Prize location:{" "}
                {hunt.locationNote ??
                  `${hunt.mapLatitude}, ${hunt.mapLongitude}`}
              </p>
              <p>Entry code: {hunt.entryCode || "—"}</p>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HuntQueue;
