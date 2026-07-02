import type { DateInputValues } from "../types/DateInputValues";

export function stringToDateInput(fecha: string) {
    const [year, month, day] = fecha.split("-");
    return {
        day,
        month,
        year,
    };
}

export function dateInputToString(fecha: DateInputValues) {
    return `${fecha.year}-${fecha.month}-${fecha.day}`;
}