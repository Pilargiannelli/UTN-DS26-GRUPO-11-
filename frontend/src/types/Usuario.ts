import type { PacienteProps } from "./PacienteProps.ts";
import type { MedicoProps } from "./MedicoProps.ts";
import type { UserProps } from "./UserProps.ts";

export type Usuario =
  | { u: string; p: string; rol: "paciente"; foto?: string; docs: PacienteProps }
  | { u: string; p: string; rol: "medico"; foto?: string; docs: MedicoProps }
  | { u: string; p: string; rol: "admin"; foto?: string; docs: UserProps };
