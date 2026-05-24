import classNames from "classnames";
import { MapPinned } from "lucide-react";
import ButtonLink from "@/_components/ui/buttons/button-link";
import CountdownTimer from "@/_components/ui/countdown-timer";

interface HuntCardProps {
  heading: string;
  buttonLink?: string;
  buttonText: string;
  cssClasses?: string;
  deadline: string;
  deadlineLabel: string;
  prizeAmount: number;
  activeHunters: number;
}

const HuntCard = ({
  heading,
  buttonLink = "#",
  buttonText,
  cssClasses,
  deadline,
  deadlineLabel,
  prizeAmount,
  activeHunters,
}: HuntCardProps) => {
  return (
    <div
      className={classNames(
        "bg-orange rounded-[6px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col gap-5 p-5 overflow-hidden",
        cssClasses
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex gap-2 items-center">
          <MapPinned size={20} color="white" />
          <h3 className="text-white">{heading}</h3>
        </div>
        <CountdownTimer deadline={deadline} />
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex gap-[10px]">
          <p className="text-white w-[140px] shrink-0">Deadline:</p>
          <p className="text-white flex-1">{deadlineLabel}</p>
        </div>
        <div className="flex gap-[10px]">
          <p className="text-white w-[140px] shrink-0">Prize:</p>
          <p className="text-white flex-1">R{prizeAmount}</p>
        </div>
        <div className="flex gap-[10px]">
          <p className="text-white w-[140px] shrink-0">Hunters on the case:</p>
          <p className="text-white flex-1">{activeHunters}</p>
        </div>
      </div>

      <ButtonLink href={buttonLink} cssClasses="w-full">
        {buttonText}
      </ButtonLink>
    </div>
  );
};

export default HuntCard;
