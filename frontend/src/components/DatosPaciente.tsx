import type { PacienteProps } from "../types/PacienteProps.ts";
import { useEdad } from "../hooks/useEdad";

export function DatosPaciente({ docs }: { docs: PacienteProps }) {
  const edad = useEdad(docs.fechaNacimiento);

  return (
    <div className="text-start">
        <div className="dato">
            <h5>Sexo:</h5>
            <p>{docs.sexo}</p>
        </div>
        <div className="dato">
            <h5>Fecha de nacimiento:</h5>
            <p>{docs.fechaNacimiento}</p>
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
            <p>{docs.obraSocial}</p>
        </div>
        <div className="dato">
            <h5>Consultas registradas:</h5>
            <p>{docs.historial.consultas.length}</p>
        </div>
    </div>
  );
}