import { useState, useEffect } from "react";
import type { Usuario } from "../types/Usuario";

export function useUsuarioSeleccionado() {
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | undefined>(undefined);
    useEffect(() => {
        const guardado = localStorage.getItem("usuarioSeleccionado");
        if (guardado) {
            Promise.resolve().then(() => { setUsuarioSeleccionado(JSON.parse(guardado)); });
        }
    }, []);
    const seleccionarUsuario = (usuario: Usuario) => {
        setUsuarioSeleccionado(usuario);
        localStorage.setItem("usuarioSeleccionado", JSON.stringify(usuario));
    };
    const limpiarUsuario = () => {
        setUsuarioSeleccionado(undefined);
        localStorage.removeItem("usuarioSeleccionado");
    };
    return { usuarioSeleccionado, seleccionarUsuario, limpiarUsuario };
}
