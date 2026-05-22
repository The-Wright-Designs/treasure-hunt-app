import classNames from "classnames";

export const buttonStyles = (
  cssClasses?: string,
  disabled?: boolean,
  pending?: boolean,
  colorTeal?: boolean,
  colorOrange?: boolean,
  colorGrey?: boolean,
  secondary?: boolean,
) =>
  classNames(
    "flex font-medium text-subheading text-center px-4 justify-center rounded-[6px] desktop:hover:cursor-pointer",
    cssClasses,
    {
      "opacity-50": pending || disabled,
      "cursor-not-allowed": pending || disabled,
      "bg-teal text-white": colorTeal && !secondary,
      "bg-orange text-white": colorOrange && !secondary,
      "bg-black/40 text-white": colorGrey && !secondary,
      "bg-black text-white":
        !colorTeal && !colorOrange && !colorGrey && !secondary,
      "bg-white border-[4px] text-black": secondary,
      "border-secondary": secondary && colorTeal,
      "border-primary": secondary && colorOrange,
      "border-black/40": secondary && colorGrey,
      "border-black": secondary && !colorTeal && !colorOrange && !colorGrey,
      "py-2": secondary,
      "py-3": !secondary,
    },
  );
