import type z from "zod";

interface AdminEditFormProps<AdminValidado> {
    onSave: (values: z.output<AdminValidado>) => void;
    onCancel: () => void;
}

interface PacienteFormProps<PacienteValidado> {
    onSave: (values: z.output<PacienteValidado>) => void;
    onCancel: () => void;
}

interface MedicoFormProps<MedicoValidado> {
    onSave: (values: z.output<MedicoValidado>) => void;
    onCancel: () => void;
}

export type { AdminEditFormProps, PacienteFormProps, MedicoFormProps };