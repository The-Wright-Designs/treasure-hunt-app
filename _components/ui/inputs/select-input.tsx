import classNames from "classnames";

interface Option {
  label: string;
  value: string;
}

interface Props {
  label: string;
  name: string;
  options: Option[];
  required?: boolean;
  cssClasses?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  error?: string;
  disabled?: boolean;
}

const SelectInput = ({
  label,
  name,
  options,
  required = false,
  cssClasses,
  value,
  defaultValue,
  onChange,
  error,
  disabled = false,
}: Props) => {
  return (
    <div className={classNames("flex flex-col gap-[6px] w-full", cssClasses)}>
      <label htmlFor={name} className="text-paragraph">
        {label}
        {required && " *"}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        disabled={disabled}
        className={classNames(
          "bg-white border rounded-[6px] px-3 py-2 w-full outline-none desktop:hover:cursor-pointer",
          error ? "border-error" : "border-black/50",
          disabled && "opacity-50",
        )}
        style={error ? { borderColor: "#DC2626" } : undefined}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-[12px]" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default SelectInput;
