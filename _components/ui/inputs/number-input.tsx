import classNames from "classnames";

interface Props {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  cssClasses?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  phone?: boolean;
}

const NumberInput = ({
  label,
  name,
  placeholder,
  required = false,
  cssClasses,
  value,
  onChange,
  error,
  disabled = false,
  min,
  max,
  step,
  phone = false,
}: Props) => {
  return (
    <div className={classNames("flex flex-col gap-[6px] w-full", cssClasses)}>
      <label htmlFor={name} className="text-paragraph">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={phone ? "tel" : "number"}
        inputMode={phone ? "tel" : "numeric"}
        autoComplete={phone ? "tel" : undefined}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={phone ? undefined : min}
        max={phone ? undefined : max}
        step={phone ? undefined : step}
        className={classNames(
          "bg-white border rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none",
          error ? "border-error" : "border-black/50",
          disabled && "opacity-50",
        )}
        style={error ? { borderColor: "#DC2626" } : undefined}
      />
      {error && (
        <p className="text-[12px]" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default NumberInput;
