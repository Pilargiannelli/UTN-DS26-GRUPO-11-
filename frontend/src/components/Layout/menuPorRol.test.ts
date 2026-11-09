import { describe, it, expect } from "vitest";
import { menuPorRol, menuLateralPorRol } from "./menuPorRol";

const hrefs = (items: { href: string }[]) => items.map((i) => i.href);

describe("menuPorRol", () => {
  it("define un menú para cada rol", () => {
    expect(Object.keys(menuPorRol).sort()).toEqual(["MEDICO", "PACIENTE", "SECRETARIA"]);
  });

  it("solo la SECRETARIA y el PACIENTE ven la sección de médicos; el MEDICO no", () => {
    expect(hrefs(menuPorRol.SECRETARIA)).toContain("/buscar-medico");
    expect(hrefs(menuPorRol.PACIENTE)).toContain("/buscar-medico");
    expect(hrefs(menuPorRol.MEDICO)).not.toContain("/buscar-medico");
  });

  it("solo el PACIENTE ve 'Pedir turno' y 'Mis turnos'", () => {
    expect(hrefs(menuPorRol.PACIENTE)).toEqual(expect.arrayContaining(["/pedir-turno", "/mis-turnos"]));
    expect(hrefs(menuPorRol.SECRETARIA)).not.toContain("/pedir-turno");
    expect(hrefs(menuPorRol.MEDICO)).not.toContain("/pedir-turno");
  });

  it("el PACIENTE no ve el listado de pacientes", () => {
    expect(hrefs(menuPorRol.PACIENTE)).not.toContain("/buscar-paciente");
  });

  it("no hay hrefs repetidos dentro de un mismo menú", () => {
    for (const items of Object.values(menuPorRol)) {
      expect(new Set(hrefs(items)).size).toBe(items.length);
    }
  });
});

describe("menuLateralPorRol", () => {
  it("SECRETARIA y MEDICO agregan Inicio y Turnos al comienzo", () => {
    expect(menuLateralPorRol.SECRETARIA.slice(0, 2).map((i) => i.label)).toEqual(["Inicio", "Turnos"]);
    expect(menuLateralPorRol.MEDICO.slice(0, 2).map((i) => i.label)).toEqual(["Inicio", "Turnos"]);
  });

  it("renombra 'Médicos' como 'Profesionales' para SECRETARIA y PACIENTE", () => {
    const labelMedicos = (rol: "SECRETARIA" | "PACIENTE") =>
      menuLateralPorRol[rol].find((i) => i.href === "/buscar-medico")?.label;

    expect(labelMedicos("SECRETARIA")).toBe("Profesionales");
    expect(labelMedicos("PACIENTE")).toBe("Profesionales");
  });

  it("no repite /home en los menús laterales", () => {
    for (const items of Object.values(menuLateralPorRol)) {
      expect(hrefs(items).filter((h) => h === "/home")).toHaveLength(1);
    }
  });
});
