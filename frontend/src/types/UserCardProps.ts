import type { Usuario } from './Usuario.ts';
import type { PacienteProps } from './PacienteProps.ts';
import type { MedicoProps } from './MedicoProps.ts';
import type { UserProps } from './UserProps.ts';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { PacienteValidado } from '../schemas/pacienteSchema.ts';
import type { MedicoValidado } from '../schemas/medicoSchema.ts';

interface DatosPacienteFormProps {
    docs: PacienteProps;
    register: UseFormRegister<PacienteValidado>;
    errors: FieldErrors<PacienteValidado>;
    watch: UseFormWatch<PacienteValidado>;
    setValue: UseFormSetValue<PacienteValidado>;
}

interface DatosMedicoFormProps {
    docs: MedicoProps;
    register: UseFormRegister<MedicoValidado>;
    watch: UseFormWatch<MedicoValidado>;
    errors: FieldErrors<MedicoValidado>;
    setValue: UseFormSetValue<MedicoValidado>;
}

interface UserCardProps {
    usuario: Usuario;
    onUpdate: (updatedData: PacienteProps | MedicoProps | UserProps) => void;
    isEditing: boolean;
    onEditingChange: (editing: boolean) => void;
}

export type { UserCardProps, DatosPacienteFormProps, DatosMedicoFormProps };