import type { MedicoProps } from "../types/MedicoProps";
import type { PacienteProps } from "../types/PacienteProps";
import type { UserProps } from "../types/UserProps";

export type RegistroPasoUno = PacienteProps | MedicoProps | UserProps;

interface RegistroContextType {
    datosPasoUno?: RegistroPasoUno;
    setDatosPasoUno: (datos: RegistroPasoUno) => void;
}

export type { RegistroContextType };