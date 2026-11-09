import { describe, it, expect, vi, beforeEach } from "vitest";
import bcrypt from "bcrypt";

vi.mock("../config/prisma", () => ({
  prisma: {
    usuario: { findFirst: vi.fn(), create: vi.fn(), update: vi.fn() },
    paciente: { findUnique: vi.fn(), findUniqueOrThrow: vi.fn(), update: vi.fn() },
    obraSocial: { findUnique: vi.fn() },
    cobertura: { findUnique: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
    $transaction: vi.fn(),
  },
}));

import { prisma } from "../config/prisma";
import { crearPaciente, buscarPorId, actualizarPaciente } from "./paciente.service";

const fn = (f: unknown) => f as ReturnType<typeof vi.fn>;

const datos = {
  nombre: "Ana",
  apellido: "Pérez",
  dni: "30111222",
  email: "ana@imos.test",
  telefono: "2344111111",
  sexo: "F",
  fechaNacimiento: new Date("1990-01-01"),
} as never;

describe("paciente.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fn(prisma.usuario.findFirst).mockResolvedValue(null);
    fn(prisma.usuario.create).mockResolvedValue({ id: 5 });
    fn(prisma.paciente.findUniqueOrThrow).mockResolvedValue({ id: 1 });
  });

  describe("crearPaciente", () => {
    it("rechaza un DNI repetido con 409 y mensaje del campo", async () => {
      fn(prisma.usuario.findFirst).mockResolvedValue({ dni: "30111222", email: "otro@imos.test" });

      await expect(crearPaciente(datos)).rejects.toMatchObject({ status: 409, message: "El DNI ya se encuentra registrado" });
      expect(prisma.usuario.create).not.toHaveBeenCalled();
    });

    it("rechaza un email repetido con 409", async () => {
      fn(prisma.usuario.findFirst).mockResolvedValue({ dni: "otro", email: "ana@imos.test" });

      await expect(crearPaciente(datos)).rejects.toMatchObject({ message: "El email ya se encuentra registrado" });
    });

    it("rechaza un username repetido con 409", async () => {
      fn(prisma.usuario.findFirst).mockResolvedValue({ dni: "otro", email: "otro@imos.test" });

      await expect(crearPaciente(datos, { username: "ana", password: "Clave1234" })).rejects.toMatchObject({
        message: "El nombre de usuario ya está en uso",
      });
    });

    it("rechaza una obra social inexistente con 400", async () => {
      fn(prisma.obraSocial.findUnique).mockResolvedValue(null);
      const conCobertura = { ...(datos as object), cobertura: { obraSocialId: 99, nroAfiliado: "1" } } as never;

      await expect(crearPaciente(conCobertura)).rejects.toMatchObject({ status: 400, message: "La obra social no existe" });
    });

    it("rechaza un nº de afiliado ya registrado a otro paciente con 409", async () => {
      fn(prisma.obraSocial.findUnique).mockResolvedValue({ id: 1 });
      fn(prisma.cobertura.findUnique).mockResolvedValue({ pacienteId: 777 });
      const conCobertura = { ...(datos as object), cobertura: { obraSocialId: 1, nroAfiliado: "1" } } as never;

      await expect(crearPaciente(conCobertura)).rejects.toMatchObject({ status: 409 });
    });

    it("sin credenciales, usuario y contraseña inicial son el DNI (guardada hasheada)", async () => {
      await crearPaciente(datos);

      const { data } = fn(prisma.usuario.create).mock.calls[0][0];
      expect(data.username).toBe("30111222");
      expect(data.rol).toBe("PACIENTE");
      expect(data.passwordHash).not.toBe("30111222");
      expect(await bcrypt.compare("30111222", data.passwordHash)).toBe(true);
    });

    it("con credenciales usa la contraseña elegida", async () => {
      await crearPaciente(datos, { username: "ana", password: "Clave1234" });

      const { data } = fn(prisma.usuario.create).mock.calls[0][0];
      expect(data.username).toBe("ana");
      expect(await bcrypt.compare("Clave1234", data.passwordHash)).toBe(true);
    });

    it("crea la ficha de paciente anidada y devuelve la ficha completa", async () => {
      const r = await crearPaciente(datos);

      const { data } = fn(prisma.usuario.create).mock.calls[0][0];
      expect(data.paciente.create).toMatchObject({ telefono: "2344111111", sexo: "F" });
      expect(r).toEqual({ id: 1 });
    });
  });

  describe("buscarPorId", () => {
    it("devuelve la ficha si existe", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue({ id: 3 });

      expect(await buscarPorId(3)).toEqual({ id: 3 });
    });

    it("lanza 404 si no existe", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue(null);

      await expect(buscarPorId(3)).rejects.toMatchObject({ status: 404, message: "Paciente no encontrado" });
    });
  });

  describe("actualizarPaciente", () => {
    const secretaria = { sub: 1, rol: "SECRETARIA" } as never;
    const paciente = { sub: 50, rol: "PACIENTE" } as never;

    it("lanza 404 si el paciente no existe", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue(null);

      await expect(actualizarPaciente(1, datos, secretaria)).rejects.toMatchObject({ status: 404 });
    });

    it("un PACIENTE no puede editar la ficha de otro (404)", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue({ id: 1, usuarioId: 999 });

      await expect(actualizarPaciente(1, datos, paciente)).rejects.toMatchObject({ status: 404 });
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it("un PACIENTE edita la suya dentro de una transacción", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue({ id: 1, usuarioId: 50 });

      await actualizarPaciente(1, datos, paciente);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });

    it("sin cobertura en el body se borran las coberturas existentes y no se crea ninguna", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue({ id: 1, usuarioId: 50 });

      await actualizarPaciente(1, datos, secretaria);

      expect(prisma.cobertura.deleteMany).toHaveBeenCalledWith({ where: { pacienteId: 1 } });
      expect(prisma.cobertura.create).not.toHaveBeenCalled();
    });

    it("al validar duplicados excluye al propio usuario", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue({ id: 1, usuarioId: 50 });

      await actualizarPaciente(1, datos, secretaria);

      expect(fn(prisma.usuario.findFirst).mock.calls[0][0].where.NOT).toEqual({ id: 50 });
    });
  });
});
