import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import type { NewPasswordValidada } from "../schemas/newPasswordSchema.ts";

export function useCambioPassword() {
    const navigate = useNavigate();

    // PATCH /api/auth/password: el back verifica la actual (400 si no coincide)
    // y guarda la nueva hasheada. Si falla, el error lo muestra el formulario.
    const cambiarPassword = async (datos: NewPasswordValidada) => {
        await apiFetch("/auth/password", {
            method: "PATCH",
            body: JSON.stringify({
                passwordActual: datos.currentPassword,
                passwordNueva: datos.newPassword,
            }),
        });
        navigate("/ver-perfil", { state: { passwordActualizada: true } });
    };

    return { cambiarPassword };
}
