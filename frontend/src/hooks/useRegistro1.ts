import { useNavigate } from "react-router-dom";

interface CoberturaMedicaBase {
    nroAfiliado?: string;
    plan?: string;
}

export function useRegistroPasoUno() {
    const navigate = useNavigate();
    const procesarPasoUno = <T extends CoberturaMedicaBase>(
        data: T,
        rol: "paciente" | "medico",
        urlSiguiente: string
    ) => { const datosLimpios = { ...data,
        nroAfiliado: data.nroAfiliado === "-" ? "" : data.nroAfiliado,
        plan: data.plan === "-" ? "" : data.plan,
        rol,
    };
    navigate(urlSiguiente, { state: { datosPasoUno: datosLimpios } });
  };
  return { procesarPasoUno };
}