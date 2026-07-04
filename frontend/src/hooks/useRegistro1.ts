import { useNavigate } from "react-router-dom";
import { useRegistro } from "./useRegistro";
import type { RegistroPasoUno } from "../context/RegistroContext";

export function useRegistroPasoUno() {
    const navigate = useNavigate();
    const { setDatosPasoUno } = useRegistro();
    const procesarPasoUno = (
        data: RegistroPasoUno,
        urlSiguiente: string
    ) => {
        const datosLimpios = {...data};
        setDatosPasoUno(datosLimpios);
        navigate(urlSiguiente);
    };
    return { procesarPasoUno };
}