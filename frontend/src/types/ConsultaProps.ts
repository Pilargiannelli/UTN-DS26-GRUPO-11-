interface Consulta {
    fecha: string;
    medico: string;
    motivo: string;
    diagnostico?: string;
    tratamiento?: string;
}

export type { Consulta };