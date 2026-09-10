// Se importa dotenv acá mismo (y no se depende de que index.ts ya lo haya
// llamado) porque este módulo puede terminar importado antes que index.ts
// llegue a ejecutar dotenv.config(): en CommonJS los imports se resuelven
// en el orden en que aparecen en el archivo, no al final.
import "dotenv/config";

function required(nombre: string): string {
  const valor = process.env[nombre];
  if (!valor) throw new Error(`Falta la variable de entorno ${nombre}`);
  return valor;
}

export const JWT_SECRET = required("JWT_SECRET");
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";
export const SALT_ROUNDS = Number(process.env.SALT_ROUNDS) || 10;
