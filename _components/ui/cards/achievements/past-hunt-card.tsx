import classNames from "classnames";
import { Trophy } from "lucide-react";

interface PastHuntCardProps {
  deadline: string;
  completed: boolean;
  noOfHunters: number;
  winner?: boolean;
  cssClasses?: string;
}

function formatPastHuntDate(isoString: string): string {
  const fmt = new Intl.DateTimeFormat("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).formatToParts(new Date(isoString));

  const get = (type: string) => fmt.find((p) => p.type === type)?.value ?? "";

  return `${get("day")} ${get("month")} '${get("year").slice(2)}`;
}

const PastHuntCard = ({
  deadline,
  completed,
  noOfHunters,
  winner = false,
  cssClasses,
}: PastHuntCardProps) => {
  return (
    <div
      className={classNames(
        "rounded-[6px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col gap-5 p-5 overflow-hidden",
        winner && completed ? "bg-orange" : "bg-teal",
        !completed && "opacity-60",
        cssClasses,
      )}
    >
      <div className="flex items-center justify-between gap-[10px]">
        <h3 className="text-white">{formatPastHuntDate(deadline)}</h3>
        {winner && completed && (
          <div className="bg-teal rounded-[6px] flex gap-[10px] items-center justify-center px-2 py-[6px]">
            <Trophy size={20} color="#FFFFFF" />
            <p className="text-white">Winner</p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex gap-[10px]">
          <p className="text-white w-[140px] shrink-0">Completed:</p>
          <p className="text-white flex-1">{completed ? "Yes" : "No"}</p>
        </div>
        <div className="flex gap-[10px]">
          <p className="text-white w-[140px] shrink-0">Hunters who finished:</p>
          <p className="text-white flex-1">{noOfHunters}</p>
        </div>
      </div>
    </div>
  );
};

export default PastHuntCard;
