import { useState, type ReactNode } from "react";
import { RegistroContext } from "./RegistroContextBase";
import type { RegistroPasoUno } from "./RegistroContext";

export const RegistroProvider = ({ children }: { children: ReactNode }) => {
    const [datosPasoUno, setDatosPasoUno] = useState<RegistroPasoUno>();
return (
        <RegistroContext.Provider value={{ datosPasoUno, setDatosPasoUno, }}>
            {children}
        </RegistroContext.Provider>
    );
};