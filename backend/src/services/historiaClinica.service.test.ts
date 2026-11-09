import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/prisma", () => ({
  prisma: {
    paciente: { findUnique: vi.fn() },
    medico: { findUnique: vi.fn() },
    historiaClinica: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    entradaClinica: { create: vi.fn() },
  },
}));

import { prisma } from "../config/prisma";
import { obtenerHistoria, agregarEntrada, actualizarHistoria } from "./historiaClinica.service";

const fn = (f: unknown) => f as ReturnType<typeof vi.fn>;

const medico = { sub: 2, rol: "MEDICO" } as never;
const paciente = { sub: 50, rol: "PACIENTE" } as never;

const fichaPaciente = { id: 1, usuarioId: 50, usuario: { nombre: "Ana", apellido: "Pérez", dni: "30111222" } };
const historia = {
  id: 7,
  medico: { usuario: { nombre: "Luis", apellido: "Gómez" } },
  alergias: [{ nombre: "Polen" }],
  antecedentes: [{ nombre: "Asma" }],
  entradas: [{ id: 1, diagnostico: "Gripe" }],
};

describe("historiaClinica.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fn(prisma.paciente.findUnique).mockResolvedValue(fichaPaciente);
    fn(prisma.medico.findUnique).mockResolvedValue({ id: 9 });
    fn(prisma.historiaClinica.findUnique).mockResolvedValue(historia);
    fn(prisma.historiaClinica.upsert).mockResolvedValue({ id: 7 });
  });

  describe("obtenerHistoria", () => {
    it("devuelve paciente, médico responsable, alergias, antecedentes y entradas", async () => {
      const r = await obtenerHistoria(1, medico);

      expect(r).toEqual({
        paciente: { id: 1, nombre: "Ana", apellido: "Pérez", dni: "30111222" },
        medicoResponsable: "Luis Gómez",
        alergias: ["Polen"],
        antecedentes: ["Asma"],
        entradas: [{ id: 1, diagnostico: "Gripe" }],
      });
    });

    it("un paciente sin historia devuelve listas vacías en vez de error", async () => {
      fn(prisma.historiaClinica.findUnique).mockResolvedValue(null);

      const r = await obtenerHistoria(1, medico);

      expect(r).toMatchObject({ medicoResponsable: null, alergias: [], antecedentes: [], entradas: [] });
    });

    it("lanza 404 si el paciente no existe", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue(null);

      await expect(obtenerHistoria(1, medico)).rejects.toMatchObject({ status: 404 });
    });

    it("el PACIENTE ve su propia historia", async () => {
      await expect(obtenerHistoria(1, paciente)).resolves.toBeDefined();
    });

    it("el PACIENTE recibe 404 ante la historia de otro", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue({ ...fichaPaciente, usuarioId: 999 });

      await expect(obtenerHistoria(1, paciente)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("agregarEntrada", () => {
    const entrada = { diagnostico: "Gripe", evolucion: "Mejora", observaciones: "" };

    it("crea la entrada asociada a la historia (la crea si no existía) y devuelve la historia", async () => {
      const r = await agregarEntrada(1, entrada, medico);

      expect(fn(prisma.historiaClinica.upsert).mock.calls[0][0].create).toEqual({ pacienteId: 1, medicoId: 9 });
      expect(fn(prisma.entradaClinica.create).mock.calls[0][0].data).toEqual({ ...entrada, historiaClinicaId: 7 });
      expect(r.alergias).toEqual(["Polen"]);
    });

    it("un usuario sin perfil de médico recibe 403 y no se crea nada", async () => {
      fn(prisma.medico.findUnique).mockResolvedValue(null);

      await expect(agregarEntrada(1, entrada, medico)).rejects.toMatchObject({ status: 403 });
      expect(prisma.entradaClinica.create).not.toHaveBeenCalled();
    });

    it("lanza 404 si el paciente no existe, antes de crear nada", async () => {
      fn(prisma.paciente.findUnique).mockResolvedValue(null);

      await expect(agregarEntrada(1, entrada, medico)).rejects.toMatchObject({ status: 404 });
      expect(prisma.historiaClinica.upsert).not.toHaveBeenCalled();
    });
  });

  describe("actualizarHistoria", () => {
    it("reemplaza alergias y antecedentes (set vacío + connectOrCreate por nombre)", async () => {
      await actualizarHistoria(1, { alergias: ["Polen"], antecedentes: ["Asma", "Diabetes"] }, medico);

      const { where, data } = fn(prisma.historiaClinica.update).mock.calls[0][0];
      expect(where).toEqual({ id: 7 });
      expect(data.alergias.set).toEqual([]);
      expect(data.alergias.connectOrCreate).toEqual([{ where: { nombre: "Polen" }, create: { nombre: "Polen" } }]);
      expect(data.antecedentes.connectOrCreate).toHaveLength(2);
    });

    it("un usuario sin perfil de médico recibe 403", async () => {
      fn(prisma.medico.findUnique).mockResolvedValue(null);

      await expect(actualizarHistoria(1, { alergias: [], antecedentes: [] }, medico)).rejects.toMatchObject({ status: 403 });
      expect(prisma.historiaClinica.update).not.toHaveBeenCalled();
    });
  });
});
