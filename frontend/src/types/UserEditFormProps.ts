import type { Usuario } from "./Usuario";

interface PacienteFormProps {
    // El usuario completo: nombre, DNI y email viven en Usuario; teléfono,
    // sexo, fecha de nacimiento y obra social, en usuario.paciente.
    usuario: Usuario;
    onSave: (usuarioActualizado: Usuario) => void;
    onCancel: () => void;
}

export type { PacienteFormProps };
