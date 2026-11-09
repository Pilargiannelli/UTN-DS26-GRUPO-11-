import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../config/prisma", () => ({
  prisma: { obraSocial: { findMany: vi.fn(), create: vi.fn() } },
}));

import { prisma } from "../config/prisma";
import { listarObrasSociales, crearObraSocial } from "./obraSocial.service";

const findMany = prisma.obraSocial.findMany as unknown as ReturnType<typeof vi.fn>;
const create = prisma.obraSocial.create as unknown as ReturnType<typeof vi.fn>;

describe("obraSocial.service", () => {
  beforeEach(() => {
    findMany.mockReset();
    create.mockReset();
  });

  it("listarObrasSociales las pide ordenadas por nombre ascendente", async () => {
    findMany.mockResolvedValue([{ id: 1, nombre: "OSDE" }]);

    const r = await listarObrasSociales();

    expect(r).toEqual([{ id: 1, nombre: "OSDE" }]);
    expect(findMany).toHaveBeenCalledWith({ orderBy: { nombre: "asc" } });
  });

  it("crearObraSocial persiste los datos y devuelve lo creado", async () => {
    create.mockResolvedValue({ id: 2, nombre: "Swiss Medical" });

    const r = await crearObraSocial({ nombre: "Swiss Medical" });

    expect(create).toHaveBeenCalledWith({ data: { nombre: "Swiss Medical" } });
    expect(r).toEqual({ id: 2, nombre: "Swiss Medical" });
  });
});
