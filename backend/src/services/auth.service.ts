import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env";
import { RegistroInput, LoginInput } from "../validations/auth.validation";
import { crearPaciente } from "./paciente.service";

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
      paciente: true,
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

export async function obtenerPerfil(id: number) {
  return prisma.usuario.findUnique({
    where: { id },
    include: {
      paciente: true,
      medico: true,
      secretaria: true,
    },
  });
}