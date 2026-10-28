import type z from "zod";
import type { PacienteProps } from "./PacienteProps";
import type { Usuario } from "./Usuario";
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
    // El usuario completo: nombre, apellido, DNI y email viven en Usuario;
    // matrícula y especialidad, en usuario.medico.
    medico: Usuario;
    onSave: (values: z.output<MedicoValidado>) => void;
    onCancel: () => void;
}

export type { AdminEditFormProps, PacienteFormProps, MedicoFormProps };