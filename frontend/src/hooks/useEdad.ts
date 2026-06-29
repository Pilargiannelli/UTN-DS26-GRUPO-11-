import { useMemo } from "react";

export const useEdad = (fechaNacimiento: string) => {
  const edad = useMemo(() => {
    if (!fechaNacimiento) return null;
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edadCalc = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edadCalc--;
    }
    return edadCalc;
  }, [fechaNacimiento]);
  return edad;
};
