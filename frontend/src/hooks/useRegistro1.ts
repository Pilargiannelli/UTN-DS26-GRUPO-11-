import { useNavigate } from "react-router-dom";

export function useRegistroPasoUno() {
    const navigate = useNavigate();
    const procesarPasoUno = <T>(
        data: T,
        rol: "paciente" | "medico",
        urlSiguiente: string
    ) => {
        const datosLimpios = {...data, rol,};
        navigate(urlSiguiente, { state: { datosPasoUno: datosLimpios } });
    };
    return { procesarPasoUno };
}