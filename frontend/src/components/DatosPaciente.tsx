import type { PacientePerfil } from "../types/Usuario";
import { useEdad } from "../hooks/useEdad";

const formatearFecha = (fechaStr: string | undefined | null) => {
    if (!fechaStr) return "-";
    const soloFecha = fechaStr.split("T")[0];
    const partes = soloFecha.split("-");
    if (partes.length === 3) {
        const [year, month, day] = partes;
        return `${day}/${month}/${year}`;
    }
    return fechaStr;
};

export function DatosPaciente({ docs }: { docs: PacientePerfil }) {
  const edad = useEdad(docs.fechaNacimiento);
  const cobertura = docs.coberturas?.[0];

  return (
    <div className="text-start">
        <div className="dato">
            <h5>Sexo:</h5>
            <p>{docs.sexo}</p>
        </div>
        <div className="dato">
            <h5>Fecha de nacimiento:</h5>
            <p>{formatearFecha(docs.fechaNacimiento)}</p>
        </div>
        <div className="dato">
            <h5>Edad:</h5>
            <p>{edad ?? "—"}</p>
        </div>
        <div className="dato">
            <h5>Teléfono:</h5>
            <p>{docs.telefono}</p>
        </div>
        <div className="dato">
            <h5>Obra Social:</h5>
            <p>
              {cobertura
                ? `${cobertura.obraSocial.nombre} · Plan ${cobertura.plan} · Afiliado ${cobertura.nroAfiliado}`
                : "Sin obra social"}
            </p>
        </div>
    </div>
  );
}
