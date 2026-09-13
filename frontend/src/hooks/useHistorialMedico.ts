import { useAuth } from "./useAuth";
import { useFetch } from "./useFetch";
import type { Paciente } from "../types/Paciente";
import type { Consulta } from "../types/ConsultaProps";

export interface PacienteConConsultas {
  username: string;
  nombre: string;
  apellido: string;
  consultas: Consulta[];
}

export function useHistorialMedico() {
  const { usuario } = useAuth();
  
  // Consumo de la API real de pacientes en lugar del /users.json
  const { data: pacientesAPI, loading } = useFetch<any[]>("/pacientes");

  const nombreMedico = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "";

  const pacientes: PacienteConConsultas[] = (pacientesAPI ?? [])
    .map((p) => {
      // Mapea la información recibida de la API real
      const consultasPaciente: Consulta[] = (p.historiaClinica?.entradas ?? [])
        .filter((e: any) => e.medicoNombre === nombreMedico)
        .map((e: any) => ({
          id: e.id,
          fecha: e.fecha,
          diagnostico: e.diagnostico,
          evolucion: e.evolucion,
          observaciones: e.observaciones,
          medico: e.medicoNombre,
        }));

      return {
        username: p.usuario?.username ?? "",
        nombre: p.usuario?.nombre ?? "",
        apellido: p.usuario?.apellido ?? "",
        consultas: consultasPaciente,
      };
    })
    .filter((p) => p.consultas.length > 0)
    .sort((a, b) =>
      `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)
    );

  return { pacientes, cargando: loading };
}