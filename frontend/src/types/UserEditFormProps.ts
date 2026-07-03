import type z from "zod";
import type { PacienteProps } from "./PacienteProps";
import type { MedicoProps } from "./MedicoProps";
import type { UserProps } from "./UserProps";

interface AdminEditFormProps<AdminValidado> {
    admin: UserProps;
    onSave: (values: z.output<AdminValidado>) => void;
    onCancel: () => void;
}

interface PacienteFormProps<PacienteValidado> {
    paciente: PacienteProps;
    onSave: (values: z.output<PacienteValidado>) => void;
    onCancel: () => void;
}

interface MedicoFormProps<MedicoValidado> {
    medico: MedicoProps;
    onSave: (values: z.output<MedicoValidado>) => void;
    onCancel: () => void;
}

export type { AdminEditFormProps, PacienteFormProps, MedicoFormProps };