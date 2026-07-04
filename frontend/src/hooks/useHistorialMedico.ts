import { useAuth } from "./useAuth";
import { useFetch } from "./useFetch";
import type { Usuario } from "../types/Usuario";
import type { Consulta } from "../types/ConsultaProps";

export interface PacienteConConsultas {
  username: string;
  nombre: string;
  apellido: string;
  consultas: Consulta[];
}

export function useHistorialMedico() {
  const { usuario } = useAuth();
  const { data: users, loading } = useFetch<Usuario[]>("/users.json");

  const nombreMedico = usuario
    ? `${usuario.docs?.nombre} ${usuario.docs?.apellido}`
    : "";

  const pacientes: PacienteConConsultas[] = (users ?? [])
    .filter((u): u is Extract<Usuario, { rol: "paciente" }> => u.rol === "paciente")
    .map((u) => ({
      username: u.u,
      nombre: u.docs.nombre,
      apellido: u.docs.apellido,
      consultas: u.docs.historial.consultas.filter(
        (c) => c.medico === nombreMedico
      ),
    }))
    .filter((p) => p.consultas.length > 0)
    .sort((a, b) =>
      `${a.apellido} ${a.nombre}`.localeCompare(`${b.apellido} ${b.nombre}`)
    );

  return { pacientes, cargando: loading };
}
