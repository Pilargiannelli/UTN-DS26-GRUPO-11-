import type { Consulta } from "./ConsultaProps.ts";

interface HistorialMedico {
    consultas: Consulta[];
    alergias?: string[];
    antecedentes?: string[];
}

export type { HistorialMedico };