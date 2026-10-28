import { useState } from "react";
import type { Usuario } from "../types/Usuario";

export function useUsuarioSeleccionado() {
    // Inicializamos el estado directamente leyendo de localStorage de forma segura
    const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | undefined>(() => {
        const guardado = localStorage.getItem("usuarioSeleccionado");
        if (guardado) {
            try {
                return JSON.parse(guardado);
            } catch (e) {
                console.error("Error al parsear el usuario seleccionado del localStorage", e);
                return undefined;
            }
        }
        return undefined;
    });

    // Permite guardar el objeto completo asegurando que tenga la estructura correcta
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