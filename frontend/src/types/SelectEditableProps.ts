import type { UseFormRegister, FieldValues, Path } from "react-hook-form";

interface SelectEditableProps<T extends FieldValues = FieldValues> {
  label: string;
  name: Path<T>;
  jsonPath: string;
  register: UseFormRegister<T>;
  error?: string;
}

export type { SelectEditableProps };