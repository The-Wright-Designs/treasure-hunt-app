import { buttonStyles } from "@/_styles/button-styles";
import { ButtonProps } from "@/_types/button-types";
import Link from "next/link";

const ButtonLink = ({
  children,
  onClick,
  cssClasses,
  href = "#",
  disabled,
  ariaLabel,
  colorTeal,
  colorOrange,
  colorGrey,
  secondary,
  target = "_self",
}: ButtonProps) => {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={buttonStyles(cssClasses, disabled, false, colorTeal, colorOrange, colorGrey, secondary)}
      aria-label={ariaLabel}
      target={target}
    >
      {children}
    </Link>
  );
};

export default ButtonLink;
