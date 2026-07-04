import { useNavigate } from "react-router-dom";
import type { SinginData } from "../schemas/newUserSchema";
import { useAuth } from "./useAuth";
import type { Usuario } from "../types/Usuario";
import { useUsuarioSeleccionado } from "./useUsuarioSeleccionado";
import { useRegistro } from "./useRegistro";

export function useRegistroFinal() {
    const { seleccionarUsuario } = useUsuarioSeleccionado();
    const navigate = useNavigate();
    const { rol } = useAuth();
    const { datosPasoUno } = useRegistro();
    if (!datosPasoUno) { throw new Error("No se encontraron los datos del formulario anterior."); }
    const registrarUsuario = <T extends SinginData>(credenciales: T) => {
        const objetoCompletoFinal = {
            u: credenciales.username,
            p: credenciales.password,
            foto: "",
            rol: datosPasoUno.rol,
            docs: datosPasoUno,
        };
        seleccionarUsuario(objetoCompletoFinal as Usuario);
        console.log("¡Objeto definitivo listo para el POST simulado!", objetoCompletoFinal);
        const pathDestino = rol === "unlogged" ? "/" : "/ver-perfil";
        navigate(pathDestino, { state: { registroExitoso: true } });
    };
    return { registrarUsuario, tieneDatosPrevios: !!datosPasoUno, };
}