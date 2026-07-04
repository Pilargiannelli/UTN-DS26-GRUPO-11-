import { createContext } from "react";
import type { RegistroContextType } from "./RegistroContext";

export const RegistroContext = createContext<RegistroContextType>({
    datosPasoUno: undefined,
    setDatosPasoUno: () => {},
});