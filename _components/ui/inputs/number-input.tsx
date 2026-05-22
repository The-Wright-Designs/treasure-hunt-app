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
  min?: number;
  max?: number;
  step?: number;
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
  min,
  max,
  step,
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
        type="number"
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        step={step}
        className={classNames(
          "bg-white border rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none",
          error ? "border-error" : "border-black/50",
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
