import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { prisma } from "../config/prisma";
import { JWT_SECRET, JWT_EXPIRES_IN, SALT_ROUNDS } from "../config/env";
import { RegistroInput, LoginInput } from "../validations/auth.validation";

// El passwordHash no viaja en la respuesta: prisma.ts lo omite globalmente
// (omit: { usuario: { passwordHash: true } }) para todas las queries.
export async function registrar(datos: RegistroInput) {
  const { password, ...resto } = datos;
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.usuario.create({
    data: { ...resto, passwordHash },
  });
}

export async function login(datos: LoginInput) {
  // omit: false pisa el omit global solo para esta query: acá sí necesitamos
  // el hash para poder compararlo con bcrypt.
  const usuario = await prisma.usuario.findUnique({
    where: { email: datos.email },
    omit: { passwordHash: false },
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
  return prisma.usuario.findUnique({ where: { id } });
}
