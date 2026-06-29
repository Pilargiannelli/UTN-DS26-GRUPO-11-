import type { UseFormRegister, FieldErrors, FieldValues } from "react-hook-form";

interface DateInputProps<TFieldValues extends FieldValues> {
  label: string;
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  fieldName: keyof TFieldValues;
}

export type { DateInputProps };