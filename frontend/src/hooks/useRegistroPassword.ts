import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";
import type { NewPasswordValidada } from "../schemas/newPasswordSchema.ts";

export function useCambioPassword() {
    const navigate = useNavigate();
    const { usuario } = useAuth();
    const cambiarPassword = <T extends NewPasswordValidada>(datos: T) => {
        if (!usuario) { throw new Error("No hay un usuario autenticado."); }
        const usuarioActualizado = { ...usuario, password: datos.newPassword, };
        console.log( "Objeto definitivo listo para el PATCH simulado:", usuarioActualizado );
        // Espacio para la futura persistencia a través de la API
        navigate("/ver-perfil", { state: { passwordActualizada: true, }, });
    };
    return { cambiarPassword };
}