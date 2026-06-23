import type { UserProps } from "./UserProps";

interface PacienteProps extends UserProps {
    telefono: string;
    obraSocial: string;
}

export type { PacienteProps };