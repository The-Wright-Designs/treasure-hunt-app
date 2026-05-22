"use client";

import { useState } from "react";
import classNames from "classnames";
import { Eye, EyeOff } from "lucide-react";

interface Props {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  cssClasses?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const TextInput = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  cssClasses,
  value,
  onChange,
  error,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={classNames("flex flex-col gap-[6px] w-full", cssClasses)}>
      <label htmlFor={name} className="text-paragraph">
        {label}
        {required && " *"}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={isPassword ? (showPassword ? "text" : "password") : type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className={classNames(
            "bg-white border rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none",
            error ? "border-error" : "border-black/50",
          )}
          style={error ? { borderColor: "#DC2626" } : undefined}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 desktop:hover:cursor-pointer"
          >
            {showPassword ? (
              <EyeOff color="#1D1D1D" size={16} />
            ) : (
              <Eye color="#1D1D1D" size={16} />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[12px]" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default TextInput;
