import type { Usuario } from './Usuario.ts';

interface UserCardProps {
    usuario: Usuario;
    // Recibe el usuario ya guardado en el back (PUT /api/pacientes/:id)
    onUpdate: (usuarioActualizado: Usuario) => void;
    isEditing: boolean;
    onEditingChange: (editing: boolean) => void;
}

export type { UserCardProps };
