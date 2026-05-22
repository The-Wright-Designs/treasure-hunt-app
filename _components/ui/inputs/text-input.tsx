import classNames from "classnames";

interface Props {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  cssClasses?: string;
}

const TextInput = ({
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  cssClasses,
}: Props) => {
  return (
    <div className={classNames("flex flex-col gap-[6px] w-full", cssClasses)}>
      <label htmlFor={name} className="text-paragraph font-bold">
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="bg-white border border-black/50 rounded-[6px] px-3 py-2 w-full placeholder:text-black/25 outline-none"
      />
    </div>
  );
};

export default TextInput;
