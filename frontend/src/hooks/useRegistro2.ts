import { useLocation, useNavigate } from "react-router-dom";
import type { SinginData } from "../schemas/newUserSchema";
import { useAuth } from "./useAuth";

export function useRegistroFinal() {
    const location = useLocation();
    const navigate = useNavigate();
    const { rol } = useAuth();
    const datosPasoUno = location.state?.datosPasoUno as Record<string, unknown> | undefined;
    const registrarUsuario = <T extends SinginData>(credenciales: T) => {
        if (!datosPasoUno) { throw new Error("No se encontraron los datos del formulario anterior."); }
        const objetoCompletoFinal = {...datosPasoUno,
            username: credenciales.username,
            password: credenciales.password,
            id: Date.now(),
        };
        console.log("¡Objeto definitivo listo para el POST simulado!", objetoCompletoFinal);
        const pathDestino = rol === "unlogged" ? "/" : "/home";
        navigate(pathDestino, { state: { registroExitoso: true } });
    };
    return { registrarUsuario, tieneDatosPrevios: !!datosPasoUno, };
}