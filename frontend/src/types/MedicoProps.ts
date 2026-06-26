import type { UserProps } from "./UserProps.ts";

interface MedicoProps extends UserProps {
  especialidad: string;
  matricula: string;
}

export type { MedicoProps };