import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } from "../config/env";
import { RegistroInput, LoginInput, CambioPasswordInput } from "../validations/auth.validation";
import { crearPaciente } from "./paciente.service";
import { ErrorNegocio } from "../errors/ErrorNegocio";

// Autoregistro: el mismo alta que hace la secretaria (Usuario + Paciente),
// pero con la contraseña que eligió el paciente. El passwordHash no viaja en
// la respuesta: prisma.ts lo omite globalmente.
export async function registrar(datos: RegistroInput) {
  const { password, username, ...paciente } = datos;
  return crearPaciente(paciente, { username, password });
}

export async function login(datos: LoginInput) {
  // omit: false pisa el omit global solo para esta query: acá sí necesitamos
  // el hash para poder compararlo con bcrypt.
  const usuario = await prisma.usuario.findUnique({
    where: { email: datos.email },
    omit: { passwordHash: false },
    include: {
      paciente: { include: { coberturas: { include: { obraSocial: true } } } },
      medico: true,
      secretaria: true,
    },
  });

  const credencialesValidas =
    usuario !== null && (await bcrypt.compare(datos.password, usuario.passwordHash));

  if (!credencialesValidas) return null;

  const { passwordHash, ...usuarioSinHash } = usuario!;

  const token = jwt.sign({ sub: usuarioSinHash.id, rol: usuarioSinHash.rol }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });

  return { token, usuario: usuarioSinHash };
}

// Cambio de contraseña del propio usuario. La actual incorrecta responde 400,
// no 401: en el front un 401 con token significa "sesión vencida" y cierra la
// sesión, y acá el usuario sí está autenticado.
export async function cambiarPassword(usuarioId: number, datos: CambioPasswordInput) {
  const usuario = await prisma.usuario.findUniqueOrThrow({
    where: { id: usuarioId },
    // select explícito: pisa el omit global solo para esta query
    select: { passwordHash: true },
  });

  if (!(await bcrypt.compare(datos.passwordActual, usuario.passwordHash))) {
    throw new ErrorNegocio(400, "La contraseña actual es incorrecta");
  }

  await prisma.usuario.update({
    where: { id: usuarioId },
    data: { passwordHash: await bcrypt.hash(datos.passwordNueva, SALT_ROUNDS) },
  });
}

export async function obtenerPerfil(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      // Con la obra social: el paciente la ve y la edita en su perfil
      paciente: { include: { coberturas: { include: { obraSocial: true } } } },
      medico: true,
      secretaria: true,
    },
  });
}