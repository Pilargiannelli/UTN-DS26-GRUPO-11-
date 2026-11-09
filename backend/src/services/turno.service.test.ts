import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/prisma", () => ({
  prisma: {
    turno: { findMany: vi.fn(), findUnique: vi.fn(), findFirst: vi.fn(), create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    medico: { findUnique: vi.fn() },
    paciente: { findUnique: vi.fn() },
    secretaria: { findUnique: vi.fn() },
  },
}));

import { prisma } from "../config/prisma";
import { ErrorNegocio } from "../errors/ErrorNegocio";
import {
  findAllParaUsuario,
  findByIdParaUsuario,
  crearParaUsuario,
  cancelarParaUsuario,
  updateParaUsuario,
  horariosOcupados,
  removeParaUsuario,
} from "./turno.service";

const db = {
  turno: vi.mocked(prisma.turno),
  medico: vi.mocked(prisma.medico),
  paciente: vi.mocked(prisma.paciente),
  secretaria: vi.mocked(prisma.secretaria),
};
const fn = (f: unknown) => f as ReturnType<typeof vi.fn>;

const FUTURO = new Date("2099-01-05T10:00:00.000Z");
const PASADO = new Date("2000-01-05T10:00:00.000Z");

const secretaria = { sub: 1, rol: "SECRETARIA" } as never;
const medico = { sub: 2, rol: "MEDICO" } as never;
const paciente = { sub: 3, rol: "PACIENTE" } as never;

const turno = (extra = {}) => ({ id: 10, medicoId: 20, pacienteId: 30, fechaHora: FUTURO, estado: "Pendiente", ...extra });

describe("turno.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fn(db.medico.findUnique).mockResolvedValue({ id: 20 });
    fn(db.paciente.findUnique).mockResolvedValue({ id: 30 });
    fn(db.secretaria.findUnique).mockResolvedValue({ id: 40 });
    fn(db.turno.findFirst).mockResolvedValue(null);
  });

  describe("findAllParaUsuario (filtrado por identidad)", () => {
    it("la SECRETARIA ve todos los turnos, sin filtro", async () => {
      fn(db.turno.findMany).mockResolvedValue([]);

      await findAllParaUsuario(secretaria);

      expect(fn(db.turno.findMany).mock.calls[0][0]).not.toHaveProperty("where");
    });

    it("el MEDICO ve solo los suyos", async () => {
      fn(db.turno.findMany).mockResolvedValue([]);

      await findAllParaUsuario(medico);

      expect(fn(db.turno.findMany).mock.calls[0][0].where).toEqual({ medicoId: 20 });
    });

    it("el PACIENTE ve solo los suyos", async () => {
      fn(db.turno.findMany).mockResolvedValue([]);

      await findAllParaUsuario(paciente);

      expect(fn(db.turno.findMany).mock.calls[0][0].where).toEqual({ pacienteId: 30 });
    });

    it("un MEDICO o PACIENTE sin perfil recibe lista vacía y no consulta turnos", async () => {
      fn(db.medico.findUnique).mockResolvedValue(null);
      fn(db.paciente.findUnique).mockResolvedValue(null);

      expect(await findAllParaUsuario(medico)).toEqual([]);
      expect(await findAllParaUsuario(paciente)).toEqual([]);
      expect(db.turno.findMany).not.toHaveBeenCalled();
    });
  });

  describe("findByIdParaUsuario (titularidad)", () => {
    it("un turno inexistente responde ErrorNegocio 404", async () => {
      fn(db.turno.findUnique).mockResolvedValue(null);

      await expect(findByIdParaUsuario(10, secretaria)).rejects.toMatchObject({ status: 404 });
    });

    it("la SECRETARIA accede a cualquier turno", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ medicoId: 999 }));

      await expect(findByIdParaUsuario(10, secretaria)).resolves.toMatchObject({ id: 10 });
    });

    it("el MEDICO accede a un turno propio", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno());

      await expect(findByIdParaUsuario(10, medico)).resolves.toMatchObject({ id: 10 });
    });

    it("el MEDICO recibe 404 (no 403) ante un turno de otro médico", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ medicoId: 999 }));

      await expect(findByIdParaUsuario(10, medico)).rejects.toMatchObject({ status: 404, message: "Turno no encontrado" });
    });

    it("el PACIENTE recibe 404 ante un turno de otro paciente", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ pacienteId: 999 }));

      await expect(findByIdParaUsuario(10, paciente)).rejects.toMatchObject({ status: 404 });
    });
  });

  describe("crearParaUsuario", () => {
    it("rechaza con 409 si el médico ya tiene un turno activo a esa hora (RN-002)", async () => {
      fn(db.turno.findFirst).mockResolvedValue({ id: 1 });

      await expect(crearParaUsuario({ medicoId: 20, fechaHora: FUTURO } as never, paciente)).rejects.toMatchObject({
        status: 409,
        message: "El médico ya tiene un turno en ese horario",
      });
      expect(db.turno.create).not.toHaveBeenCalled();
    });

    it("el PACIENTE crea el turno a su nombre y Pendiente, aunque el body mande otro pacienteId", async () => {
      fn(db.turno.create).mockResolvedValue({ id: 1 });

      await crearParaUsuario({ medicoId: 20, fechaHora: FUTURO, pacienteId: 999 } as never, paciente);

      expect(fn(db.turno.create).mock.calls[0][0].data).toEqual({
        medicoId: 20,
        fechaHora: FUTURO,
        pacienteId: 30,
        estado: "Pendiente",
      });
    });

    it("un PACIENTE sin perfil recibe ErrorNegocio 403", async () => {
      fn(db.paciente.findUnique).mockResolvedValue(null);

      const intento = crearParaUsuario({ medicoId: 20, fechaHora: FUTURO } as never, paciente);

      await expect(intento).rejects.toBeInstanceOf(ErrorNegocio);
      await expect(intento).rejects.toMatchObject({ status: 403 });
    });

    it("la SECRETARIA queda como secretariaId del turno (sale del token, no del body)", async () => {
      fn(db.turno.create).mockResolvedValue({ id: 1 });

      await crearParaUsuario({ medicoId: 20, pacienteId: 30, fechaHora: FUTURO, secretariaId: 777 } as never, secretaria);

      expect(fn(db.turno.create).mock.calls[0][0].data.secretariaId).toBe(40);
    });
  });

  describe("cancelarParaUsuario", () => {
    it("cancela un turno Pendiente futuro cambiando el estado (no lo borra)", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno());
      fn(db.turno.update).mockResolvedValue({ id: 10, estado: "Cancelado" });

      await cancelarParaUsuario(10, paciente);

      expect(fn(db.turno.update).mock.calls[0][0]).toMatchObject({ where: { id: 10 }, data: { estado: "Cancelado" } });
      expect(db.turno.delete).not.toHaveBeenCalled();
    });

    it("no cancela un turno que ya pasó", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ fechaHora: PASADO }));

      await expect(cancelarParaUsuario(10, secretaria)).rejects.toMatchObject({ status: 409 });
    });

    it("no cancela un turno ya cancelado", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ estado: "Cancelado" }));

      await expect(cancelarParaUsuario(10, secretaria)).rejects.toMatchObject({
        status: 409,
        message: "El turno ya está cancelado",
      });
    });

    it("el PACIENTE no puede cancelar un turno Confirmado (RN-006)", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ estado: "Confirmado" }));

      await expect(cancelarParaUsuario(10, paciente)).rejects.toMatchObject({ status: 409 });
      expect(db.turno.update).not.toHaveBeenCalled();
    });

    it("la SECRETARIA sí puede cancelar un turno Confirmado", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ estado: "Confirmado" }));
      fn(db.turno.update).mockResolvedValue({});

      await cancelarParaUsuario(10, secretaria);

      expect(db.turno.update).toHaveBeenCalledTimes(1);
    });

    it("el PACIENTE puede cancelar un turno Reprogramado", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ estado: "Reprogramado" }));
      fn(db.turno.update).mockResolvedValue({});

      await cancelarParaUsuario(10, paciente);

      expect(db.turno.update).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateParaUsuario", () => {
    it("no permite cambiar el estado de un turno que ya pasó", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ fechaHora: PASADO }));

      await expect(updateParaUsuario(10, { estado: "Confirmado" } as never, secretaria)).rejects.toMatchObject({
        status: 409,
      });
    });

    it("chequea superposición excluyendo al propio turno", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno());
      fn(db.turno.update).mockResolvedValue({});

      await updateParaUsuario(10, { fechaHora: new Date("2099-01-06T10:00:00.000Z") } as never, secretaria);

      expect(fn(db.turno.findFirst).mock.calls[0][0].where.NOT).toEqual({ id: 10 });
    });

    it("rechaza con 409 si el nuevo horario ya está ocupado", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno());
      fn(db.turno.findFirst).mockResolvedValue({ id: 99 });

      await expect(
        updateParaUsuario(10, { fechaHora: new Date("2099-01-06T10:00:00.000Z") } as never, secretaria)
      ).rejects.toMatchObject({ status: 409 });
      expect(db.turno.update).not.toHaveBeenCalled();
    });

    it("al cancelar por update no chequea superposición (libera el horario)", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno());
      fn(db.turno.update).mockResolvedValue({});

      await updateParaUsuario(10, { estado: "Cancelado" } as never, secretaria);

      expect(db.turno.findFirst).not.toHaveBeenCalled();
    });
  });

  it("horariosOcupados devuelve solo las fechas, en el rango pedido y de turnos activos", async () => {
    fn(db.turno.findMany).mockResolvedValue([{ fechaHora: FUTURO }]);
    const hasta = new Date("2099-01-10T00:00:00.000Z");

    const r = await horariosOcupados(20, FUTURO, hasta);

    expect(r).toEqual([FUTURO]);
    const { where } = fn(db.turno.findMany).mock.calls[0][0];
    expect(where.medicoId).toBe(20);
    expect(where.fechaHora).toEqual({ gte: FUTURO, lt: hasta });
    expect(where.estado.in).not.toContain("Cancelado");
  });

  describe("removeParaUsuario", () => {
    it("borra el turno propio", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno());

      await removeParaUsuario(10, medico);

      expect(db.turno.delete).toHaveBeenCalledWith({ where: { id: 10 } });
    });

    it("no borra un turno ajeno", async () => {
      fn(db.turno.findUnique).mockResolvedValue(turno({ medicoId: 999 }));

      await expect(removeParaUsuario(10, medico)).rejects.toMatchObject({ status: 404 });
      expect(db.turno.delete).not.toHaveBeenCalled();
    });
  });
});
