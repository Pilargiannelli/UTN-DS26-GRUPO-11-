import { describe, it, expect, vi, beforeEach } from "vitest";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

vi.mock("../config/prisma", () => ({
  prisma: {
    usuario: {
      findUnique: vi.fn(),
      findUniqueOrThrow: vi.fn(),
      findFirst: vi.fn(),
      update: vi.fn(),
    },
  },
}));
vi.mock("./paciente.service", () => ({ crearPaciente: vi.fn() }));

import { prisma } from "../config/prisma";
import { ErrorNegocio } from "../errors/ErrorNegocio";
import { crearPaciente } from "./paciente.service";
import { login, cambiarPassword, actualizarPerfil, registrar } from "./auth.service";

const mockFn = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const usuarioDb = mockFn(prisma.usuario.findUnique);

describe("auth.service", () => {
  let hash: string;

  beforeEach(async () => {
    vi.clearAllMocks();
    hash = await bcrypt.hash("Correcta1", 4);
  });

  describe("login", () => {
    it("con credenciales válidas devuelve un token JWT firmado y el usuario sin passwordHash", async () => {
      usuarioDb.mockResolvedValue({ id: 7, email: "ana@imos.test", rol: "PACIENTE", passwordHash: hash });

      const r = await login({ email: "ana@imos.test", password: "Correcta1" });

      expect(r).not.toBeNull();
      expect(r!.usuario).not.toHaveProperty("passwordHash");
      const payload = jwt.verify(r!.token, process.env.JWT_SECRET!) as jwt.JwtPayload;
      expect(payload.sub).toBe(7);
      expect(payload.rol).toBe("PACIENTE");
    });

    it("con contraseña incorrecta devuelve null", async () => {
      usuarioDb.mockResolvedValue({ id: 7, rol: "PACIENTE", passwordHash: hash });

      expect(await login({ email: "ana@imos.test", password: "Incorrecta1" })).toBeNull();
    });

    it("con un email inexistente devuelve null (igual que con password mala)", async () => {
      usuarioDb.mockResolvedValue(null);

      expect(await login({ email: "nadie@imos.test", password: "Correcta1" })).toBeNull();
    });
  });

  describe("registrar", () => {
    it("separa password y username del resto y delega en crearPaciente", async () => {
      mockFn(crearPaciente).mockResolvedValue({ id: 1 });

      await registrar({ nombre: "Ana", username: "ana", password: "Correcta1" } as never);

      expect(crearPaciente).toHaveBeenCalledWith({ nombre: "Ana" }, { username: "ana", password: "Correcta1" });
    });
  });

  describe("cambiarPassword", () => {
    it("con la contraseña actual incorrecta lanza ErrorNegocio 400 y no actualiza", async () => {
      mockFn(prisma.usuario.findUniqueOrThrow).mockResolvedValue({ passwordHash: hash });

      const intento = cambiarPassword(1, { passwordActual: "Mala1234", passwordNueva: "Nueva1234" });

      await expect(intento).rejects.toBeInstanceOf(ErrorNegocio);
      await expect(intento).rejects.toMatchObject({ status: 400 });
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    it("con la actual correcta guarda un hash nuevo (no la contraseña en claro)", async () => {
      mockFn(prisma.usuario.findUniqueOrThrow).mockResolvedValue({ passwordHash: hash });

      await cambiarPassword(1, { passwordActual: "Correcta1", passwordNueva: "Nueva1234" });

      const { data, where } = mockFn(prisma.usuario.update).mock.calls[0][0];
      expect(where).toEqual({ id: 1 });
      expect(data.passwordHash).not.toBe("Nueva1234");
      expect(await bcrypt.compare("Nueva1234", data.passwordHash)).toBe(true);
    });
  });

  describe("actualizarPerfil", () => {
    it("si el email ya lo usa otra cuenta lanza ErrorNegocio 409", async () => {
      mockFn(prisma.usuario.findFirst).mockResolvedValue({ id: 99 });

      await expect(
        actualizarPerfil(1, { nombre: "A", apellido: "B", email: "usado@imos.test" } as never)
      ).rejects.toMatchObject({ status: 409, message: "El email ya se encuentra registrado" });
      expect(prisma.usuario.update).not.toHaveBeenCalled();
    });

    it("si el email está libre actualiza y devuelve el perfil", async () => {
      mockFn(prisma.usuario.findFirst).mockResolvedValue(null);
      usuarioDb.mockResolvedValue({ id: 1, email: "nuevo@imos.test" });

      const r = await actualizarPerfil(1, { nombre: "A", apellido: "B", email: "nuevo@imos.test" } as never);

      expect(prisma.usuario.update).toHaveBeenCalledTimes(1);
      expect(r).toEqual({ id: 1, email: "nuevo@imos.test" });
    });

    it("al buscar el email en uso excluye al propio usuario", async () => {
      mockFn(prisma.usuario.findFirst).mockResolvedValue(null);
      usuarioDb.mockResolvedValue({ id: 5 });

      await actualizarPerfil(5, { nombre: "A", apellido: "B", email: "x@imos.test" } as never);

      expect(mockFn(prisma.usuario.findFirst).mock.calls[0][0].where).toEqual({
        email: "x@imos.test",
        NOT: { id: 5 },
      });
    });
  });
});
