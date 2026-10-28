import { useAuth } from "./useAuth";
import { useFetch } from "./useFetch";
import type { Consulta } from "../types/ConsultaProps";

// Forma mínima de lo que se lee de GET /api/pacientes en este hook
interface EntradaApi {
  id: number;
  fecha: string;
  diagnostico: string;
  evolucion: string;
  observaciones: string;
  medicoNombre: string;
}

interface PacienteApi {
  usuario?: { username: string; nombre: string; apellido: string };
  historiaClinica?: { entradas?: EntradaApi[] } | null;
}

export interface PacienteConConsultas {
  username: string;
  nombre: string;
  apellido: string;
  consultas: Consulta[];
}

export function useHistorialMedico() {
  const { usuario } = useAuth();
  
  // Consumo de la API real de pacientes en lugar del /users.json
  const { data: pacientesAPI, loading } = useFetch<PacienteApi[]>("/pacientes");

  const nombreMedico = usuario
    ? `${usuario.nombre} ${usuario.apellido}`
    : "";

  const pacientes: PacienteConConsultas[] = (pacientesAPI ?? [])
    .map((p) => {
      // Mapea la información recibida de la API real
      const consultasPaciente: Consulta[] = (p.historiaClinica?.entradas ?? [])
        .filter((e) => e.medicoNombre === nombreMedico)
        .map((e) => ({
          fecha: e.fecha,
          medico: e.medicoNombre,
          motivo: e.observaciones,
          diagnostico: e.diagnostico,
          tratamiento: e.evolucion,
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