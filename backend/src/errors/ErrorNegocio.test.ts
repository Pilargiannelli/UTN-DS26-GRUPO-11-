import { describe, it, expect } from "vitest";
import { ErrorNegocio } from "./ErrorNegocio";

describe("ErrorNegocio", () => {
  it("guarda el status y el mensaje que recibe", () => {
    const err = new ErrorNegocio(409, "El turno ya está ocupado");

    expect(err.status).toBe(409);
    expect(err.message).toBe("El turno ya está ocupado");
  });

  it("es una instancia de Error con name ErrorNegocio", () => {
    const err = new ErrorNegocio(404, "No existe");

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(ErrorNegocio);
    expect(err.name).toBe("ErrorNegocio");
  });
});
