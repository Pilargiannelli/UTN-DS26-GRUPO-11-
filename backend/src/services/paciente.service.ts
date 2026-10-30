import bcrypt from "bcrypt";
import { prisma } from "../config/prisma";
import { SALT_ROUNDS } from "../config/env";
import { Rol } from "../generated/prisma/enums";
import { ErrorNegocio } from "../errors/ErrorNegocio";
import type { PacienteCreate } from "../validations/paciente.validation";
import type { TokenPayload } from "../middlewares/auth.middleware";

const includePaciente = {
  usuario: { select: { id: true, username: true, nombre: true, apellido: true, email: true, dni: true } },
  coberturas: { include: { obraSocial: true } },
} as const;

// Los duplicados se chequean antes de crear para devolver un mensaje por
// campo (HU-001 CA2: "El DNI ya se encuentra registrado") en vez del 409
// genérico de P2002. Al editar, excluir.usuarioId / excluir.pacienteId evitan
// que el paciente choque consigo mismo.
async function assertSinDuplicados(
  datos: PacienteCreate,
  username?: string,
  excluir?: { usuarioId: number; pacienteId: number }
) {
  const existente = await prisma.usuario.findFirst({
    where: {
      OR: [{ dni: datos.dni }, { email: datos.email }, ...(username ? [{ username }] : [])],
      ...(excluir && { NOT: { id: excluir.usuarioId } }),
    },
    select: { dni: true, email: true },
  });
  if (existente?.dni === datos.dni) throw new ErrorNegocio(409, "El DNI ya se encuentra registrado");
  if (existente?.email === datos.email) throw new ErrorNegocio(409, "El email ya se encuentra registrado");
  if (existente) throw new ErrorNegocio(409, "El nombre de usuario ya está en uso");

  if (datos.cobertura) {
    const { obraSocialId, nroAfiliado } = datos.cobertura;
    const obraSocial = await prisma.obraSocial.findUnique({ where: { id: obraSocialId } });
    if (!obraSocial) throw new ErrorNegocio(400, "La obra social no existe");

    const afiliadoRepetido = await prisma.cobertura.findUnique({
      where: { obraSocialId_nroAfiliado: { obraSocialId, nroAfiliado } },
    });
    if (afiliadoRepetido && afiliadoRepetido.pacienteId !== excluir?.pacienteId) {
      throw new ErrorNegocio(409, "Ese número de afiliado ya está registrado en esa obra social");
    }
  }
}

// Crea Usuario (rol PACIENTE) + Paciente (+ Cobertura) en una sola escritura
// anidada: Prisma la hace atómica, así nunca queda un usuario sin su ficha.
// Sin password (alta por la secretaria), el usuario y la contraseña inicial
// son el DNI: el paciente la cambia después desde su perfil.
export async function crearPaciente(datos: PacienteCreate, credenciales?: { username?: string; password: string }) {
  const username = credenciales?.username ?? datos.dni;
  await assertSinDuplicados(datos, username);

  const passwordHash = await bcrypt.hash(credenciales?.password ?? datos.dni, SALT_ROUNDS);
  const { cobertura, telefono, sexo, fechaNacimiento, ...datosUsuario } = datos;

  const usuario = await prisma.usuario.create({
    data: {
      ...datosUsuario,
      username,
      passwordHash,
      rol: Rol.PACIENTE,
      paciente: {
        create: {
          telefono,
          sexo,
          fechaNacimiento,
          ...(cobertura && { coberturas: { create: cobertura } }),
        },
      },
    },
  });

  // Devuelve la ficha del paciente con la misma forma que GET /api/pacientes
  return prisma.paciente.findUniqueOrThrow({ where: { usuarioId: usuario.id }, include: includePaciente });
}

// GET /api/pacientes/:id: la ficha de un paciente (secretaria y médico). Le da
// a cada paciente su propia dirección en el front (/pacientes/:id).
export async function buscarPorId(pacienteId: number) {
  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId }, include: includePaciente });
  if (!paciente) throw new ErrorNegocio(404, "Paciente no encontrado");
  return paciente;
}

// PUT /api/pacientes/:id: reemplaza los datos del paciente. Sin cobertura en
// el body = "Sin obra social" (se borran las que tenía). El PACIENTE solo
// edita la suya: otra responde 404, igual que los turnos.
export async function actualizarPaciente(pacienteId: number, datos: PacienteCreate, usuario: TokenPayload) {
  const paciente = await prisma.paciente.findUnique({ where: { id: pacienteId } });
  if (!paciente || (usuario.rol === Rol.PACIENTE && paciente.usuarioId !== usuario.sub)) {
    throw new ErrorNegocio(404, "Paciente no encontrado");
  }
  await assertSinDuplicados(datos, undefined, { usuarioId: paciente.usuarioId, pacienteId });

  const { cobertura, telefono, sexo, fechaNacimiento, ...datosUsuario } = datos;
  await prisma.$transaction([
    prisma.usuario.update({ where: { id: paciente.usuarioId }, data: datosUsuario }),
    prisma.paciente.update({ where: { id: pacienteId }, data: { telefono, sexo, fechaNacimiento } }),
    prisma.cobertura.deleteMany({ where: { pacienteId } }),
    ...(cobertura ? [prisma.cobertura.create({ data: { ...cobertura, pacienteId } })] : []),
  ]);

  return prisma.paciente.findUniqueOrThrow({ where: { id: pacienteId }, include: includePaciente });
}
