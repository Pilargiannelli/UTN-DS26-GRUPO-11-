import { useCallback, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";
import { Calendar3 } from "react-bootstrap-icons";
import type { DateInputProps } from "../types/DateInputProps.ts";
import "../assets/styles/DateInput.css";
import { type FieldValues, type Path, get } from "react-hook-form";

const hoy = () => new Date().toLocaleDateString("en-CA");

type Parte = "day" | "month" | "year";

// Fecha con el selector del navegador: se puede escribir en el campo (dd/mm/aaaa) o elegir en el calendario.
// El formulario sigue recibiendo { day, month, year }: tres campos ocultos guardan cada parte.
export function DateInput<TFieldValues extends FieldValues>({ label, register, errors, fieldName }: DateInputProps<TFieldValues>) {
    const fieldErrors = get(errors, fieldName as string);
    const mensajeDe = (error?: { message?: string } | string) => (typeof error === "string" ? error : error?.message);
    const bruto = mensajeDe(fieldErrors?.day) || mensajeDe(fieldErrors?.month) || mensajeDe(fieldErrors?.year);
    // Con un solo campo de fecha, "el año es requerido" no se entiende: se avisa de la fecha completa
    const mensaje = bruto && /requerid/i.test(bruto) ? "Ingrese la fecha de nacimiento" : bruto;

    const dia = register(`${String(fieldName)}.day` as Path<TFieldValues>);
    const mes = register(`${String(fieldName)}.month` as Path<TFieldValues>);
    const anio = register(`${String(fieldName)}.year` as Path<TFieldValues>);
    const ocultos = useRef<Record<Parte, HTMLInputElement | null>>({ day: null, month: null, year: null });
    const visible = useRef<HTMLInputElement>(null);

    const refDia = useCallback((el: HTMLInputElement | null) => { ocultos.current.day = el; dia.ref(el); }, [dia]);
    const refMes = useCallback((el: HTMLInputElement | null) => { ocultos.current.month = el; mes.ref(el); }, [mes]);
    const refAnio = useCallback((el: HTMLInputElement | null) => { ocultos.current.year = el; anio.ref(el); }, [anio]);

    // El campo visible muestra lo que tienen los ocultos (valores iniciales al editar, o cambios desde afuera)
    useEffect(() => {
        const { day, month, year } = ocultos.current;
        const entrada = visible.current;
        if (!entrada || document.activeElement === entrada) return;
        const actual = day?.value && month?.value && year?.value
            ? `${year.value}-${month.value.padStart(2, "0")}-${day.value.padStart(2, "0")}`
            : "";
        if (entrada.value !== actual) entrada.value = actual;
    });

    const escribir = (parte: Parte, valorNuevo: string) => {
        const entrada = ocultos.current[parte];
        if (!entrada) return;
        const asignar = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
        asignar?.call(entrada, valorNuevo);
        entrada.dispatchEvent(new Event("input", { bubbles: true }));
    };

    const alCambiar = (e: React.ChangeEvent<HTMLInputElement>) => {
        const [y = "", m = "", d = ""] = e.target.value ? e.target.value.split("-") : [];
        escribir("day", d);
        escribir("month", m);
        escribir("year", y);
    };

    const alSalir = () => {
        const { year } = ocultos.current;
        if (year) anio.onBlur({ target: year, type: "blur" });
    };

    return (
        <Form.Group className="mb-3 date-input-grupo">
            <Form.Label className="d-flex me-auto">{label}</Form.Label>
            <div className="date-input-campo">
                <Calendar3 className="date-input-icono" aria-hidden="true" />
                <Form.Control
                    ref={visible}
                    type="date"
                    aria-label={label}
                    min="1900-01-01"
                    max={hoy()}
                    onChange={alCambiar}
                    onBlur={alSalir}
                    isInvalid={!!mensaje}
                />
            </div>
            <input type="text" hidden tabIndex={-1} name={dia.name} onChange={dia.onChange} onBlur={dia.onBlur} ref={refDia} />
            <input type="text" hidden tabIndex={-1} name={mes.name} onChange={mes.onChange} onBlur={mes.onBlur} ref={refMes} />
            <input type="text" hidden tabIndex={-1} name={anio.name} onChange={anio.onChange} onBlur={anio.onBlur} ref={refAnio} />
            <Form.Control.Feedback type="invalid" className={mensaje ? "d-block" : undefined}>{mensaje}</Form.Control.Feedback>
        </Form.Group>
    );
}
