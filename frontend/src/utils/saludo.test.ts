import { describe, it, expect } from "vitest";
import { saludoSegunHora } from "./saludo";

const aLas = (hora: number) => new Date(2026, 5, 10, hora, 0, 0);

describe("saludoSegunHora", () => {
  it.each([
    [6, "Buenos días"],
    [12, "Buenos días"],
    [13, "Buenas tardes"],
    [19, "Buenas tardes"],
    [20, "Buenas noches"],
    [23, "Buenas noches"],
    [0, "Buenas noches"],
    [5, "Buenas noches"],
  ])("a las %i h saluda con '%s'", (hora, esperado) => {
    expect(saludoSegunHora(aLas(hora))).toBe(esperado);
  });

  it("sin argumento usa la hora actual y devuelve alguno de los tres saludos", () => {
    expect(["Buenos días", "Buenas tardes", "Buenas noches"]).toContain(saludoSegunHora());
  });
});
