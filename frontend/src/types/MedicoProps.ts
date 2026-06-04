import type { UserProps } from "./UserProps";

interface MedicoProps extends UserProps {
  especialidad: string;
  matricula: string;
}

export type { MedicoProps };