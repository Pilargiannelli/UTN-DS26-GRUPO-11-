import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/prisma", () => ({
  prisma: { medico: { findMany: vi.fn() } },
}));

import { prisma } from "../config/prisma";
import { listarEspecialidades } from "./especialidad.service";

const findMany = prisma.medico.findMany as unknown as ReturnType<typeof vi.fn>;

describe("listarEspecialidades", () => {
  beforeEach(() => {
    findMany.mockReset();
  });

  it("devuelve las especialidades ordenadas alfabéticamente", async () => {
    findMany.mockResolvedValue([
      { especialidad: "Pediatría" },
      { especialidad: "Cardiología" },
      { especialidad: "Dermatología" },
    ]);

    expect(await listarEspecialidades()).toEqual(["Cardiología", "Dermatología", "Pediatría"]);
  });

  it("descarta las especialidades vacías o nulas", async () => {
    findMany.mockResolvedValue([{ especialidad: null }, { especialidad: "" }, { especialidad: "Clínica" }]);

    expect(await listarEspecialidades()).toEqual(["Clínica"]);
  });

  it("pide a la base solo valores distintos de especialidad", async () => {
    findMany.mockResolvedValue([]);

    await listarEspecialidades();

    expect(findMany).toHaveBeenCalledWith({ select: { especialidad: true }, distinct: ["especialidad"] });
  });
});
