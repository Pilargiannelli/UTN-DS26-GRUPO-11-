import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { SelectorTurno } from "./SelectorTurno";
import { apiFetch } from "../services/api";
import { HORARIOS_CONSULTORIO, claveFecha, diasHabiles } from "../utils/horarios";

vi.mock("../services/api", () => ({ apiFetch: vi.fn() }));

// Fecha fija: lunes 3 de noviembre de 2031, 07:00 (antes del primer horario)
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2031, 10, 3, 7, 0));
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.mocked(apiFetch).mockReset();
});

// Ocupa todos los horarios del martes 4 y dos del lunes 3
function ocupar() {
  const martes = HORARIOS_CONSULTORIO.map((h) => new Date(`2031-11-04T${h}:00`).toISOString());
  const lunes = ["09:00", "09:30"].map((h) => new Date(`2031-11-03T${h}:00`).toISOString());
  vi.mocked(apiFetch).mockResolvedValue([...lunes, ...martes]);
}

// Envoltorio con estado, como lo usan PedirTurno y NuevoTurnoModal
function Contenedor() {
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  return <SelectorTurno medicoId="1" fecha={fecha} hora={hora} onFecha={setFecha} onHora={setHora} />;
}

describe("diasHabiles", () => {
  it("saltea sábados y domingos", () => {
    const dias = diasHabiles(new Date(2031, 10, 7), 3); // viernes 7
    expect(dias.map(claveFecha)).toEqual(["2031-11-07", "2031-11-10", "2031-11-11"]);
  });
});

describe("SelectorTurno", () => {
  it("sin médico pide elegir uno primero", () => {
    render(<SelectorTurno medicoId="" fecha="" hora="" onFecha={vi.fn()} onHora={vi.fn()} />);
    expect(screen.getByText(/Elegí un profesional/)).toBeInTheDocument();
  });

  it("muestra 10 días hábiles con sus horarios libres y bloquea los completos", async () => {
    ocupar();
    render(<Contenedor />);

    const lunes = await screen.findByRole("button", { name: /lunes, 3 de noviembre: 22 horarios libres/ });
    expect(lunes).toBeEnabled();
    const martes = screen.getByRole("button", { name: /martes, 4 de noviembre: sin horarios/ });
    expect(martes).toBeDisabled();
    expect(screen.getAllByRole("button", { pressed: false }).filter((b) => b.closest(".selector-turno-dias"))).toHaveLength(10);
    expect(screen.queryByRole("button", { name: /sábado/ })).not.toBeInTheDocument();
  });

  it("al elegir un día muestra sus horarios, con los ocupados deshabilitados", async () => {
    ocupar();
    render(<Contenedor />);

    fireEvent.click(await screen.findByRole("button", { name: /lunes, 3 de noviembre: 22/ }));
    expect(screen.getByRole("button", { name: "09:00, no disponible" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "10:00" }));
    expect(screen.getByRole("button", { name: "10:00" })).toHaveAttribute("aria-pressed", "true");
  });

  it("las flechas pasan a las dos semanas siguientes en un solo pedido", async () => {
    ocupar();
    render(<Contenedor />);
    await screen.findByRole("button", { name: /lunes, 3 de noviembre: 22/ });

    fireEvent.click(screen.getByRole("button", { name: "Días siguientes" }));
    await waitFor(() => expect(screen.getByRole("button", { name: /lunes, 17 de noviembre/ })).toBeInTheDocument());
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });
});
