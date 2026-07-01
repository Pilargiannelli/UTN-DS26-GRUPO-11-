import type { UserProps } from "./UserProps.ts";

interface HistorialProps {
    alergias: string[];
    antecedentes: string[];
    consultas: {
        fecha: string;
        medico: string;
        motivo: string;
        diagnostico: string;
        tratamiento: string;
    }[];
}
interface PacienteProps extends UserProps {
    telefono: string;
    obraSocial: string;
    fechaNacimiento: string;
    sexo: "Masculino"|"Femenino"|"Otro"
    historial: HistorialProps;
}

export type { PacienteProps };