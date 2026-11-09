import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import ContadorTurnos from "./ContadorTurnos";

describe("ContadorTurnos: efecto al pasar el mouse", () => {
  it("la tarjeta se eleva al entrar el mouse y vuelve a su lugar al salir", () => {
    const { container } = render(<ContadorTurnos turnosHoy={1} />);
    const tarjeta = container.querySelector(".tarjeta") as HTMLElement;

    fireEvent.mouseEnter(tarjeta);
    expect(tarjeta.style.transform).toBe("translateY(-3px)");

    fireEvent.mouseLeave(tarjeta);
    expect(tarjeta.style.transform).toBe("translateY(0)");
  });

  it("dibuja exactamente tres tarjetas", () => {
    const { container } = render(<ContadorTurnos />);

    expect(container.querySelectorAll(".tarjeta")).toHaveLength(3);
  });
});
