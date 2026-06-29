import type { UserProps } from "./UserProps.ts";

interface PacienteProps extends UserProps {
    telefono: string;
    obraSocial: string;
    fechaNacimiento: string;
    sexo: "Masculino"|"Femenino"|"Otro"
    historial: [];
}

export type { PacienteProps };