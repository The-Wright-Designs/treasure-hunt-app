import classNames from "classnames";

export const buttonStyles = (
  cssClasses?: string,
  disabled?: boolean,
  pending?: boolean,
  colorTeal?: boolean,
  colorOrange?: boolean,
  colorGrey?: boolean,
) =>
  classNames(
    "flex text-subheading text-white text-center px-4 py-2 justify-center rounded-[6px] desktop:hover:cursor-pointer",
    cssClasses,
    {
      "opacity-40": (pending || disabled) && !colorGrey,
      "cursor-not-allowed": pending || disabled,
      "bg-teal": colorTeal,
      "bg-orange": colorOrange,
      "bg-black opacity-40": colorGrey,
      "bg-black": !colorTeal && !colorOrange && !colorGrey,
    },
  );
