"use client";

import { useState } from "react";
import classNames from "classnames";

interface Props {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  placeholder?: string;
  disabled?: boolean;
  cssClasses?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EmailInput = ({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
  cssClasses,
}: Props) => {
  const [touched, setTouched] = useState(false);

  const error = touched && value.length > 0 && !EMAIL_REGEX.test(value);

  return (
    <div className={classNames("flex flex-col gap-[6px] w-full", cssClasses)}>
      <label htmlFor={name} className="text-paragraph">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type="email"
        value={value}
        onChange={(e) => {
          setTouched(true);
          onChange(e);
        }}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={classNames(
          "bg-white border rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none",
          error ? "border-error" : "border-black/50",
          disabled && "opacity-50"
        )}
      />
      {error && (
        <p className="text-[12px]" style={{ color: "#DC2626" }}>
          Please enter a valid email address
        </p>
      )}
    </div>
  );
};

export default EmailInput;
