import { ChangeEvent } from "react";

interface FieldOption {
  label: string;
  value: string;
}

interface PatientFormFieldProps {
  id: string;
  name: string;
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
  options?: FieldOption[];
}

export default function PatientFormField({
  id,
  name,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  error,
  options
}: PatientFormFieldProps) {
  const inputClassName = error ? "patient-input patient-input-error" : "patient-input";
  const isSelectField = Array.isArray(options) && options.length > 0;

  return (
    <div className="patient-field">
      <label className="patient-label" htmlFor={id}>
        {label} {required && <span className="required-indicator">*</span>}
      </label>
      {isSelectField ? (
        <select
          id={id}
          className={inputClassName}
          name={name}
          value={value}
          onChange={onChange}
          required={required}
          disabled={disabled}
        >
          {placeholder ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          className={inputClassName}
          name={name}
          value={value}
          onChange={onChange}
          type={type}
          required={required}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
      {error ? <p className="field-error">{error}</p> : null}
    </div>
  );
}
