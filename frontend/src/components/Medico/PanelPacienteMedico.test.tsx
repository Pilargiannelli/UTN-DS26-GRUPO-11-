import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { PanelPacienteMedico } from "./PanelPacienteMedico";
import { apiFetch } from "../../services/api";
import type { Usuario } from "../../types/Usuario";

vi.mock("../../services/api", () => ({ apiFetch: vi.fn(), ApiError: class extends Error {} }));
vi.mock("../../hooks/useFetch", () => ({ useFetch: () => ({ data: [], loading: false, error: null }) }));
vi.mock("../Turnos/NuevoTurnoModal", () => ({ default: () => <p>Modal de turno</p> }));

const historia = {
  paciente: { id: 1, nombre: "María", apellido: "Flores", dni: "35123456" },
  medicoResponsable: "Carlos Gómez",
  alergias: ["Penicilina"],
  antecedentes: ["Hipertensión"],
  entradas: [
    { id: 2, historiaClinicaId: 1, fecha: "2026-10-12T13:00:00.000Z", diagnostico: "Control post-operatorio", evolucion: "Buena", observaciones: "" },
    { id: 1, historiaClinicaId: 1, fecha: "2026-09-02T13:00:00.000Z", diagnostico: "Esguince de tobillo", evolucion: "Reposo", observaciones: "Hielo" },
  ],
};

const usuario: Usuario = {
  id: 10, username: "maria", nombre: "María", apellido: "Flores", dni: "35123456",
  email: "maria@gmail.com", fotoPerfil: null, rol: "PACIENTE",
  paciente: {
    id: 1, fechaNacimiento: "1990-05-14T00:00:00.000Z", sexo: "Femenino", telefono: "5492344123456",
    coberturas: [{ nroAfiliado: "OS-1", plan: "210", obraSocial: { id: 1, nombre: "OSDE" } }],
  },
};

beforeEach(() => {
  // GET devuelve la historia; PUT/POST devuelven la historia que les pasamos
  vi.mocked(apiFetch).mockImplementation(async (_url: string, opciones?: RequestInit) => {
    if (!opciones?.method) return historia;
    const cuerpo = JSON.parse(String(opciones.body));
    return { ...historia, ...cuerpo };
  });
});

afterEach(() => {
  cleanup();
  vi.mocked(apiFetch).mockReset();
});

const renderizar = () => render(<MemoryRouter><PanelPacienteMedico usuario={usuario} paciente={usuario.paciente!} /></MemoryRouter>);

describe("Ficha del paciente para el médico", () => {
  it("muestra las alergias como alerta y las consultas de la más nueva a la más vieja", async () => {
    renderizar();

    expect(await screen.findByText("Penicilina")).toHaveClass("lista-editable-chip-alerta");
    const diagnosticos = screen.getAllByText(/Control post-operatorio|Esguince de tobillo/).map((p) => p.textContent);
    expect(diagnosticos).toEqual(["Control post-operatorio", "Esguince de tobillo"]);
  });

  it("las consultas no tienen botón de editar ni borrar (Ley 26.529)", async () => {
    renderizar();
    const lista = (await screen.findByText("Control post-operatorio")).closest("ol")!;
    expect(within(lista).queryAllByRole("button")).toHaveLength(0);
  });

  it("muestra solo las 3 consultas más recientes y un botón Ver todas", async () => {
    const mas = Array.from({ length: 5 }, (_, i) => ({
      id: 10 + i, historiaClinicaId: 1, fecha: `2026-0${i + 1}-10T13:00:00.000Z`, diagnostico: `Consulta ${i + 1}`, evolucion: "Ok", observaciones: "",
    })).reverse();
    vi.mocked(apiFetch).mockResolvedValue({ ...historia, entradas: mas });
    renderizar();

    await screen.findByText("Consulta 5");
    expect(screen.getByText("Consulta 3")).toBeInTheDocument();
    expect(screen.queryByText("Consulta 2")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ver todas (5)" })).toBeInTheDocument();
  });

  it("sin más de 3 consultas no aparece Ver todas", async () => {
    renderizar();
    await screen.findByText("Control post-operatorio");
    expect(screen.queryByRole("button", { name: /Ver todas/ })).not.toBeInTheDocument();
  });

  it("el médico agrega una alergia y la guarda", async () => {
    renderizar();
    fireEvent.click(await screen.findByRole("button", { name: "Editar alergias" }));
    fireEvent.change(screen.getByLabelText("Agregar a alergias"), { target: { value: "Látex" } });
    fireEvent.keyDown(screen.getByLabelText("Agregar a alergias"), { key: "Enter" });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() =>
      expect(apiFetch).toHaveBeenCalledWith(
        "/pacientes/1/historia-clinica",
        expect.objectContaining({ method: "PUT", body: JSON.stringify({ alergias: ["Penicilina", "Látex"], antecedentes: ["Hipertensión"] }) })
      )
    );
    expect(await screen.findByText("Látex")).toBeInTheDocument();
  });

  it("'Nueva consulta' abre el formulario en la historia clínica", async () => {
    renderizar();
    await screen.findByText("Penicilina");
    fireEvent.click(screen.getAllByRole("button", { name: /Nueva consulta/ })[0]);
    expect(screen.getByLabelText("Diagnóstico")).toBeInTheDocument();
  });
});
