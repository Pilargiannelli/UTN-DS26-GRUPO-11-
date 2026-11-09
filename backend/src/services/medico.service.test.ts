import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";

vi.mock("../config/prisma", () => ({
  prisma: {
    usuario: { findFirst: vi.fn(), create: vi.fn() },
    medico: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn() },
  },
}));

import { prisma } from "../config/prisma";
import { crearMedico, buscarPorId } from "./medico.service";

const fn = (f: unknown) => f as ReturnType<typeof vi.fn>;

const datos = {
  nombre: "Carlos",
  apellido: "Gómez",
  dni: "30123456",
  email: "carlos@imos.test",
  especialidad: "Cardiología",
  matricula: "MP-12345",
} as never;

describe("medico.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fn(prisma.usuario.findFirst).mockResolvedValue(null);
    fn(prisma.medico.findUnique).mockResolvedValue(null);
    fn(prisma.usuario.create).mockResolvedValue({ id: 10 });
    fn(prisma.medico.findUniqueOrThrow).mockResolvedValue({ id: 1, especialidad: "Cardiología" });
  });

  describe("crearMedico", () => {
    it("rechaza un DNI repetido con 409", async () => {
      fn(prisma.usuario.findFirst).mockResolvedValue({ dni: "30123456", email: "otro@imos.test" });

      await expect(crearMedico(datos)).rejects.toMatchObject({ status: 409, message: "El DNI ya se encuentra registrado" });
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it("rechaza un email repetido con 409", async () => {
      fn(prisma.usuario.findFirst).mockResolvedValue({ dni: "otro", email: "carlos@imos.test" });

      await expect(crearMedico(datos)).rejects.toMatchObject({ status: 409, message: "El email ya se encuentra registrado" });
    });

    it("rechaza una matrícula repetida con 409", async () => {
      fn(prisma.medico.findUnique).mockResolvedValue({ id: 2, matricula: "MP-12345" });

      await expect(crearMedico(datos)).rejects.toMatchObject({ status: 409, message: "La matrícula ya se encuentra registrada" });
    });

    it("sin credenciales, usuario y contraseña inicial son el DNI (hasheada)", async () => {
      await crearMedico(datos);

      const { data } = fn(prisma.usuario.create).mock.calls[0][0];
      expect(data.username).toBe("30123456");
      expect(data.rol).toBe("MEDICO");
      expect(await bcrypt.compare("30123456", data.passwordHash)).toBe(true);
    });

    it("crea la ficha de médico anidada y devuelve la ficha completa", async () => {
      const r = await crearMedico(datos);

      const { data } = fn(prisma.usuario.create).mock.calls[0][0];
      expect(data.medico.create).toMatchObject({ especialidad: "Cardiología", matricula: "MP-12345" });
      expect(r).toEqual({ id: 1, especialidad: "Cardiología" });
    });
  });

  describe("buscarPorId", () => {
    it("devuelve la ficha si existe", async () => {
      fn(prisma.medico.findUnique).mockResolvedValue({ id: 3 });

      expect(await buscarPorId(3)).toEqual({ id: 3 });
    });

    it("lanza 404 si no existe", async () => {
      fn(prisma.medico.findUnique).mockResolvedValue(null);

      await expect(buscarPorId(3)).rejects.toMatchObject({ status: 404, message: "Médico no encontrado" });
    });
  });
});