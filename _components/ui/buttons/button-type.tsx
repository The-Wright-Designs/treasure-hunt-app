"use client";

import classNames from "classnames";
import { useFormStatus } from "react-dom";
import { ButtonProps } from "@/_types/button-types";
import { buttonStyles } from "@/_styles/button-styles";

const ButtonType = ({
  children,
  onClick,
  cssClasses,
  type = "submit",
  disabled = false,
  colorTeal,
  colorOrange,
  colorGrey,
  secondary,
  ariaLabel,
  title,
}: ButtonProps) => {
  const { pending } = useFormStatus();

  return (
    <button
      type={type}
      onClick={onClick}
      aria-label={ariaLabel}
      className={buttonStyles(
        cssClasses,
        disabled,
        pending,
        colorTeal,
        colorOrange,
        colorGrey,
        secondary,
      )}
      disabled={disabled || pending}
      title={title}
    >
      {pending && type === "submit" ? (
        <div className="flex items-center justify-center">
          <div
            className={classNames("spinner", {
              "spinner-black": colorOrange || colorGrey || colorTeal,
            })}
          />
        </div>
      ) : (
        <>{children}</>
      )}
    </button>
  );
};

export default ButtonType;
