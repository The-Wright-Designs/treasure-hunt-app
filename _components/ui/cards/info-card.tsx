import classNames from "classnames";
import { ShieldCheck, Megaphone } from "lucide-react";
import ButtonLink from "@/_components/ui/buttons/button-link";
import CardSlider from "@/_components/ui/cards/card-slider";

interface InfoCardProps {
  backgroundColor?: "orange" | "teal";
  heading: string;
  icon: "shield-check" | "megaphone";
  buttonLink?: string;
  buttonText: string;
  buttonColor?: "teal" | "orange" | "grey" | "black";
  cssClasses?: string;
  children?: React.ReactNode;
  sliderData?: string[];
}

const iconMap = {
  "shield-check": ShieldCheck,
  megaphone: Megaphone,
};

const InfoCard = ({
  backgroundColor = "orange",
  heading,
  icon,
  buttonLink = "#",
  buttonText,
  buttonColor,
  cssClasses,
  children,
  sliderData,
}: InfoCardProps) => {
  const Icon = iconMap[icon];

  return (
    <div
      className={classNames(
        "rounded-[6px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.1)] flex flex-col gap-5 p-5 overflow-hidden",
        {
          "bg-orange": backgroundColor === "orange",
          "bg-teal": backgroundColor === "teal",
        },
        cssClasses,
      )}
    >
      <div className="flex gap-2 items-center">
        <Icon size={20} color="white" />
        <h3 className="text-white">{heading}</h3>
      </div>
      {sliderData ? (
        <CardSlider slides={sliderData} />
      ) : (
        <p className="bg-white rounded-[6px] p-3 w-full">{children}</p>
      )}
      <ButtonLink
        href={buttonLink}
        cssClasses="w-full"
        colorTeal={buttonColor === "teal"}
        colorOrange={buttonColor === "orange"}
        colorGrey={buttonColor === "grey"}
      >
        {buttonText}
      </ButtonLink>
    </div>
  );
};

export default InfoCard;
