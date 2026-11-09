import { describe, it, expect, beforeEach } from "vitest";
import { guardarToken, obtenerToken, borrarToken } from "./sesion";

describe("sesion (token en localStorage)", () => {
  beforeEach(() => localStorage.clear());

  it("sin token guardado obtenerToken devuelve null", () => {
    expect(obtenerToken()).toBeNull();
  });

  it("guardarToken y obtenerToken van y vuelven", () => {
    guardarToken("abc.def.ghi");

    expect(obtenerToken()).toBe("abc.def.ghi");
  });

  it("guarda el token bajo la clave 'token'", () => {
    guardarToken("t");

    expect(localStorage.getItem("token")).toBe("t");
  });

  it("borrarToken lo elimina", () => {
    guardarToken("t");

    borrarToken();

    expect(obtenerToken()).toBeNull();
  });
});
