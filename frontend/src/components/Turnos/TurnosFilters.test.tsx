import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import TurnosFilters from "./TurnosFilters";

describe("TurnosFilters", () => {
  it("el botón '+ Nuevo Turno' dispara onNuevoTurno", () => {
    const onNuevoTurno = vi.fn();
    render(<TurnosFilters onNuevoTurno={onNuevoTurno} />);

    fireEvent.click(screen.getByRole("button", { name: "+ Nuevo Turno" }));

    expect(onNuevoTurno).toHaveBeenCalledTimes(1);
  });
});
