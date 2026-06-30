import { Form } from "react-bootstrap";
import type { DateInputProps } from "../types/DateInputProps.ts";
import { type FieldValues, type Path, get } from "react-hook-form";
import { useDateInput } from "../hooks/useDateInput.ts";
import { useDate } from "../hooks/useDate.ts";

export function DateInput<TFieldValues extends FieldValues>({ label, register, errors, fieldName }: DateInputProps<TFieldValues>) {
    const fieldErrors = get(errors, fieldName as string);
    const getFieldErrorMessage = (error?: { message?: string } | string) =>
    typeof error === "string" ? error : error?.message;
    const { handleDayChange, handleMonthChange, handleYearChange } = useDate(String(fieldName));
    return (
        <Form.Group className="mb-3">
            <Form.Label className="d-flex me-auto">{label}</Form.Label>
            <div className="d-flex gap-2">
                {/* Día */}
                <Form.Control type="text" inputMode="numeric" placeholder="DD" maxLength={2} {...register(`${String(fieldName)}.day` as Path<TFieldValues>, {...useDateInput(2), onChange: handleDayChange})} isInvalid={!!getFieldErrorMessage(fieldErrors?.day)} />
                {/* Mes */}
                <Form.Control type="text" inputMode="numeric" placeholder="MM" maxLength={2} {...register(`${String(fieldName)}.month` as Path<TFieldValues>, {...useDateInput(2), onChange: handleMonthChange})} isInvalid={!!getFieldErrorMessage(fieldErrors?.month)} />
                {/* Año */}
                <Form.Control type="text" inputMode="numeric" placeholder="YYYY" maxLength={4} {...register(`${String(fieldName)}.year` as Path<TFieldValues>, {...useDateInput(4), onChange: handleYearChange})} isInvalid={!!getFieldErrorMessage(fieldErrors?.year)} />
            </div>
            <Form.Control.Feedback type="invalid"> {getFieldErrorMessage(fieldErrors?.day) || getFieldErrorMessage(fieldErrors?.month) || getFieldErrorMessage(fieldErrors?.year)} </Form.Control.Feedback>
        </Form.Group>
    );
}