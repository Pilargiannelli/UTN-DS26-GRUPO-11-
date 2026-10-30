import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import GestionTurnos from "./GestionTurnos";
import type { Turno } from "../types/Turno";

const mocks = vi.hoisted(() => ({ turnos: [] as Turno[] }));
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ usuario: { rol: "SECRETARIA", nombre: "Ana" }, tieneRol: (rol: string) => rol === "SECRETARIA" }) }));
vi.mock("../hooks/useFetch", () => ({ useFetch: () => ({ data: mocks.turnos, loading: false, error: null }) }));
vi.mock("../components/Turnos/NuevoTurnoModal", () => ({ default: ({ show, onClose }: { show: boolean; onClose: () => void }) => show ? <div role="dialog" aria-label="Nuevo turno"><button onClick={onClose}>Cerrar</button></div> : null }));

afterEach(() => { cleanup(); mocks.turnos = []; });
const renderizar = () => render(<MemoryRouter><GestionTurnos recepcion /></MemoryRouter>);

describe("Inicio de recepcion", () => {
  it("muestra saludo y rutas existentes sin repetir el proximo turno cuando no hay datos", () => {
    renderizar();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ana");
    expect(screen.getByRole("link", { name: /Ver agenda/ })).toHaveAttribute("href", "/orden-del-dia");
    expect(screen.getByRole("link", { name: /Registrar paciente/ })).toHaveAttribute("href", "/registrar-paciente");
    expect(screen.queryByText("Próxima atención")).not.toBeInTheDocument();
    expect(screen.getByText("Todo al día")).toBeInTheDocument();
  });
  it("abre el mismo modal desde el acceso principal sin repetir botones", () => {
    renderizar();
    for (const boton of screen.getAllByRole("button", { name: /Agendar turno/ })) {
      fireEvent.click(boton);
      expect(screen.getByRole("dialog", { name: "Nuevo turno" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  });
  it("con datos mantiene el paciente, las acciones y los estados", () => {
    mocks.turnos = [{ id: 1, estado: "Pendiente", fechaHora: "2099-03-14T13:00:00.000Z", pacienteId: 1, medicoId: 1, secretariaId: null, idWhatsapp: null, pagoValidado: false, paciente: { id: 1, usuario: { nombre: "Maria", apellido: "Flores", email: "paciente@test.com" } }, medico: { id: 1, especialidad: "Traumatologia", matricula: "MP-1", usuario: { nombre: "Carlos", apellido: "Gomez", email: "medico@test.com" } } }];
    const { container } = renderizar();
    expect(screen.queryByText("Próxima atención")).not.toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "Maria Flores" })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
    expect(container.querySelector(".table-responsive")).toBeNull();
    fireEvent.click(screen.getByRole("tab", { name: /Confirmados/ }));
    expect(screen.getByText("No hay turnos confirmados próximos.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Cancelados/ }));
    expect(screen.getByText("No hay turnos cancelados próximos.")).toBeInTheDocument();
  });
});
