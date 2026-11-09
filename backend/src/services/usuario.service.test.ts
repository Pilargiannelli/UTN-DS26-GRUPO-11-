import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/prisma", () => ({
  prisma: {
    usuario: { findMany: vi.fn() },
    medico: { findMany: vi.fn() },
    paciente: { findMany: vi.fn() },
  },
}));

import { prisma } from "../config/prisma";
import { listarUsuarios, listarMedicos, listarPacientes } from "./usuario.service";

const mockFn = (fn: unknown) => fn as ReturnType<typeof vi.fn>;
const pacientesFindMany = mockFn(prisma.paciente.findMany);

const pacienteConConsulta = {
  id: 1,
  historiaClinica: { entradas: [{ fecha: "2026-05-01T10:00:00.000Z" }] },
};
const pacienteSinHistoria = { id: 2, historiaClinica: null };

describe("usuario.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("listarUsuarios no pide el passwordHash", async () => {
    mockFn(prisma.usuario.findMany).mockResolvedValue([]);

    await listarUsuarios();

    const { select } = mockFn(prisma.usuario.findMany).mock.calls[0][0];
    expect(select).not.toHaveProperty("passwordHash");
    expect(select).toMatchObject({ id: true, email: true, rol: true });
  });

  it("listarMedicos incluye solo nombre, apellido y email del usuario", async () => {
    mockFn(prisma.medico.findMany).mockResolvedValue([]);

    await listarMedicos();

    expect(mockFn(prisma.medico.findMany).mock.calls[0][0].include.usuario.select).toEqual({
      nombre: true,
      apellido: true,
      email: true,
    });
  });

  describe("listarPacientes", () => {
    it("para un MEDICO agrega la fecha de la última consulta (o null si no hay historia)", async () => {
      pacientesFindMany.mockResolvedValue([pacienteConConsulta, pacienteSinHistoria]);

      const r = await listarPacientes("MEDICO" as never);

      expect(r[0].ultimaConsulta).toBe("2026-05-01T10:00:00.000Z");
      expect(r[1].ultimaConsulta).toBeNull();
    });

    it("para una SECRETARIA no expone la última consulta ni la historia clínica", async () => {
      pacientesFindMany.mockResolvedValue([pacienteConConsulta]);

      const r = await listarPacientes("SECRETARIA" as never);

      expect(r[0]).not.toHaveProperty("ultimaConsulta");
      expect(r[0]).not.toHaveProperty("historiaClinica");
    });

    it("sin rol tampoco expone la última consulta", async () => {
      pacientesFindMany.mockResolvedValue([pacienteConConsulta]);

      const r = await listarPacientes();

      expect(r[0]).not.toHaveProperty("ultimaConsulta");
    });
  });
});
