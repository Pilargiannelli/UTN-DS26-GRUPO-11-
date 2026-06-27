import type { MedicoProps } from "../types/MedicoProps.ts";

export function DatosMedico({ docs }: { docs: MedicoProps }) {
  return (
    <div className="text-start">
      <div className="dato">
        <h5>Especialidad:</h5>
        <p>{docs.especialidad}</p>
      </div>
      <div className="dato">
        <h5>Matrícula:</h5>
        <p>{docs.matricula}</p>
      </div>
    </div>
  );
}