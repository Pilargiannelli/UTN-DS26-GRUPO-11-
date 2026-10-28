import { prisma } from "../config/prisma";
import { Rol } from "../generated/prisma/enums";
import type { TokenPayload } from "../middlewares/auth.middleware";
import { ErrorNegocio } from "../errors/ErrorNegocio";
import type { EntradaCreate, HistoriaUpdate } from "../validations/historiaClinica.validation";

// La SECRETARIA no llega acá: authorize la corta con 403 (matriz §2 y §10).

const includeHistoria = {
  medico: { include: { usuario: { select: { nombre: true, apellido: true } } } },
  alergias: { select: { nombre: true }, orderBy: { nombre: "asc" } },
  antecedentes: { select: { nombre: true }, orderBy: { nombre: "asc" } },
  entradas: { orderBy: { fecha: "desc" } },
} as const;

// El paciente solo ve su propia historia: la de otro responde 404, igual que
// los turnos, para no revelar qué ids existen.
async function buscarPaciente(pacienteId: number, usuario: TokenPayload) {
  const paciente = await prisma.paciente.findUnique({
    where: { id: pacienteId },
    include: { usuario: { select: { nombre: true, apellido: true, dni: true } } },
  });
  if (!paciente || (usuario.rol === Rol.PACIENTE && paciente.usuarioId !== usuario.sub)) {
    throw new ErrorNegocio(404, "Paciente no encontrado");
  }
  return paciente;
}

async function medicoDelToken(usuario: TokenPayload) {
  const medico = await prisma.medico.findUnique({ where: { usuarioId: usuario.sub } });
  if (!medico) throw new ErrorNegocio(403, "Tu usuario no tiene un perfil de médico");
  return medico;
}

// Forma de la respuesta: un paciente sin historia todavía devuelve listas
// vacías en vez de 404, así el front muestra "sin consultas" y deja agregar.
function aDto(
  paciente: Awaited<ReturnType<typeof buscarPaciente>>,
  historia: Awaited<ReturnType<typeof leerHistoria>>
) {
  return {
    paciente: { id: paciente.id, ...paciente.usuario },
    medicoResponsable: historia ? `${historia.medico.usuario.nombre} ${historia.medico.usuario.apellido}` : null,
    alergias: historia?.alergias.map((a) => a.nombre) ?? [],
    antecedentes: historia?.antecedentes.map((a) => a.nombre) ?? [],
    entradas: historia?.entradas ?? [],
  };
}

function leerHistoria(pacienteId: number) {
  return prisma.historiaClinica.findUnique({ where: { pacienteId }, include: includeHistoria });
}

// GET /api/pacientes/:id/historia-clinica (HU-005): de la consulta más nueva
// a la más vieja
export async function obtenerHistoria(pacienteId: number, usuario: TokenPayload) {
  const paciente = await buscarPaciente(pacienteId, usuario);
  return aDto(paciente, await leerHistoria(pacienteId));
}

// Si el paciente todavía no tiene historia, se crea con el médico que escribe
async function asegurarHistoria(pacienteId: number, medicoId: number) {
  return prisma.historiaClinica.upsert({
    where: { pacienteId },
    update: {},
    create: { pacienteId, medicoId },
  });
}

// POST /api/pacientes/:id/historia-clinica/entradas (HU-004, solo MEDICO)
export async function agregarEntrada(pacienteId: number, datos: EntradaCreate, usuario: TokenPayload) {
  const paciente = await buscarPaciente(pacienteId, usuario);
  const medico = await medicoDelToken(usuario);
  const historia = await asegurarHistoria(pacienteId, medico.id);

  await prisma.entradaClinica.create({ data: { ...datos, historiaClinicaId: historia.id } });
  return aDto(paciente, await leerHistoria(pacienteId));
}

// PUT /api/pacientes/:id/historia-clinica (solo MEDICO): reemplaza las listas
// de alergias y antecedentes. Los nombres nuevos se crean en el catálogo.
export async function actualizarHistoria(pacienteId: number, datos: HistoriaUpdate, usuario: TokenPayload) {
  const paciente = await buscarPaciente(pacienteId, usuario);
  const medico = await medicoDelToken(usuario);
  const historia = await asegurarHistoria(pacienteId, medico.id);

  const conectar = (nombres: string[]) =>
    nombres.map((nombre) => ({ where: { nombre }, create: { nombre } }));

  await prisma.historiaClinica.update({
    where: { id: historia.id },
    data: {
      alergias: { set: [], connectOrCreate: conectar(datos.alergias) },
      antecedentes: { set: [], connectOrCreate: conectar(datos.antecedentes) },
    },
  });
  return aDto(paciente, await leerHistoria(pacienteId));
}
