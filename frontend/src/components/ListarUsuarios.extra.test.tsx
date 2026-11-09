import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../hooks/useFetch", () => ({ useFetch: vi.fn() }));
vi.mock("./Turnos/NuevoTurnoModal", () => ({
  default: ({ pacienteIdInicial, onClose, onAgregar }: { pacienteIdInicial: number; onClose: () => void; onAgregar: (t: unknown) => void }) => (
    <div>
      <p>modal de turno para {pacienteIdInicial}</p>
      <button
        onClick={() => onAgregar({ fechaHora: new Date(2099, 0, 5, 10, 30).toISOString(), paciente: { usuario: { nombre: "María" } } })}
      >
        turno creado
      </button>
      <button onClick={onClose}>cerrar modal</button>
    </div>
  ),
}));

import { useFetch } from "../hooks/useFetch";
import { ListarUsuarios } from "./ListarUsuarios";

const paciente = (id: number, nombre: string, apellido: string, dni: string, extra = {}) => ({
  id,
  usuarioId: id + 100,
  fechaNacimiento: "1990-05-20",
  sexo: "Femenino",
  telefono: "2344111111",
  coberturas: [],
  usuario: { id: id + 100, nombre, apellido, dni, email: `${nombre.toLowerCase()}@x.com` },
  ...extra,
});

const medico = (id: number, nombre: string, apellido: string, especialidad: string) => ({
  id,
  usuarioId: id + 100,
  especialidad,
  matricula: `MP-${id}`,
  usuario: { id: id + 100, nombre, apellido, email: `${nombre.toLowerCase()}@x.com` },
});

function Destino() {
  const { pathname, state } = useLocation();
  return <p>destino {pathname} {JSON.stringify(state)}</p>;
}

function renderLista(rol: "paciente" | "medico", rolUsuario: string, datos: unknown[] | null, extra: { loading?: boolean; error?: Error | null } = {}) {
  vi.mocked(useFetch).mockReturnValue({ data: datos as never, loading: false, error: null, ...extra });
  const auth = { tieneRol: (r: string) => r === rolUsuario } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter initialEntries={["/lista"]}>
        <Routes>
          <Route path="/lista" element={<ListarUsuarios rol={rol} />} />
          <Route path="*" element={<Destino />} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

const filasDeDatos = () => screen.getAllByRole("row").length - 1;

describe("ListarUsuarios: estados y navegación", () => {
  beforeEach(() => {
    vi.mocked(useFetch).mockReset();
    localStorage.clear();
  });

  it("pide /pacientes o /medicos según el rol del listado", () => {
    renderLista("paciente", "SECRETARIA", []);
    expect(useFetch).toHaveBeenCalledWith("/pacientes");
  });

  it("la cartilla pide /medicos", () => {
    renderLista("medico", "PACIENTE", []);
    expect(useFetch).toHaveBeenCalledWith("/medicos");
  });

  it("mientras carga muestra un spinner con el nombre de la sección", () => {
    renderLista("paciente", "SECRETARIA", null, { loading: true });

    expect(screen.getByRole("status", { name: "Cargando pacientes" })).toBeInTheDocument();
  });

  it("si falla muestra el motivo", () => {
    renderLista("paciente", "SECRETARIA", null, { error: new Error("sin conexión") });

    expect(screen.getByText(/No se pudo cargar el listado: sin conexión/)).toBeInTheDocument();
  });

  it("ordena por apellido y nombre", () => {
    renderLista("paciente", "SECRETARIA", [paciente(1, "Zoe", "Zapata", "1"), paciente(2, "Ana", "Álvarez", "2"), paciente(3, "Bruno", "Benítez", "3")]);

    const nombres = screen.getAllByRole("button", { name: /^(Zoe|Ana|Bruno)/ }).map((b) => b.textContent);
    expect(nombres).toEqual(["Ana Álvarez", "Bruno Benítez", "Zoe Zapata"]);
  });

  describe("búsqueda", () => {
    const lista = [paciente(1, "María", "Flores", "35123456"), paciente(2, "Juan", "Rodríguez", "40987654")];

    it("ignora acentos y mayúsculas", () => {
      renderLista("paciente", "SECRETARIA", lista);

      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "MARIA" } });

      expect(filasDeDatos()).toBe(1);
      expect(screen.getByText("María Flores")).toBeInTheDocument();
    });

    it("busca por el comienzo del DNI y cuenta los resultados", () => {
      renderLista("paciente", "SECRETARIA", lista);

      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "4098" } });

      expect(screen.getByText("1 resultado")).toBeInTheDocument();
      expect(screen.getByText("Juan Rodríguez")).toBeInTheDocument();
    });

    it("sin coincidencias lo dice y 'Limpiar búsqueda' vuelve a la lista completa", () => {
      renderLista("paciente", "SECRETARIA", lista);
      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "zzz" } });
      expect(screen.getByText(/No encontramos pacientes para/)).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Limpiar búsqueda" }));

      expect(filasDeDatos()).toBe(2);
    });
  });

  describe("paginación", () => {
    const muchos = Array.from({ length: 7 }, (_, i) => paciente(i + 1, `Nombre${i}`, `Apellido${String(i).padStart(2, "0")}`, `3000000${i}`));

    it("muestra 5 por página y deja pasar a la siguiente", () => {
      renderLista("paciente", "SECRETARIA", muchos);
      expect(filasDeDatos()).toBe(5);
      expect(screen.getByText("Mostrando 1–5 de 7")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));

      expect(filasDeDatos()).toBe(2);
      expect(screen.getByText("Mostrando 6–7 de 7")).toBeInTheDocument();
    });

    it("al buscar vuelve a la primera página", () => {
      renderLista("paciente", "SECRETARIA", muchos);
      fireEvent.click(screen.getByRole("button", { name: "Página siguiente" }));

      fireEvent.change(screen.getByRole("searchbox"), { target: { value: "Nombre" } });

      expect(screen.getByText("Mostrando 1–5 de 7")).toBeInTheDocument();
    });
  });

  describe("navegación", () => {
    it("el nombre de un paciente lleva a su ficha /pacientes/:id", () => {
      renderLista("paciente", "SECRETARIA", [paciente(7, "María", "Flores", "35123456")]);

      fireEvent.click(screen.getByRole("button", { name: "María Flores" }));

      expect(screen.getByText(/destino \/pacientes\/7/)).toBeInTheDocument();
    });

    it("el nombre de un médico lo guarda como perfil seleccionado y abre /ver-perfil recordando de dónde venía", () => {
      renderLista("medico", "PACIENTE", [medico(2, "Carlos", "Gómez", "Cardiología")]);

      fireEvent.click(screen.getByRole("button", { name: "Carlos Gómez" }));

      expect(screen.getByText(/destino \/ver-perfil/)).toHaveTextContent('{"from":"/buscar-medico"}');
      const guardado = JSON.parse(localStorage.getItem("usuarioSeleccionado")!);
      expect(guardado).toMatchObject({ rol: "MEDICO", nombre: "Carlos", medico: { id: 2, especialidad: "Cardiología", matricula: "MP-2" } });
    });

    it("'+ Registrar paciente' lleva al alta (solo secretaria)", () => {
      renderLista("paciente", "SECRETARIA", [paciente(1, "Ana", "Pérez", "1")]);

      fireEvent.click(screen.getByRole("button", { name: "+ Registrar paciente" }));

      expect(screen.getByText(/destino \/registrar-paciente/)).toBeInTheDocument();
    });

    it("sin pacientes la secretaria puede registrar el primero", () => {
      renderLista("paciente", "SECRETARIA", []);

      fireEvent.click(screen.getByRole("button", { name: "Registrar el primer paciente" }));

      expect(screen.getByText(/destino \/registrar-paciente/)).toBeInTheDocument();
    });

    it("sin médicos en la cartilla lo dice y no ofrece registrar", () => {
      renderLista("medico", "PACIENTE", []);

      expect(screen.getByText("Todavía no hay médicos en la cartilla.")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Registrar/ })).not.toBeInTheDocument();
    });

    it("el paciente pide turno con un médico: va a /pedir-turno?medico=ID", () => {
      renderLista("medico", "PACIENTE", [medico(2, "Carlos", "Gómez", "Cardiología")]);

      fireEvent.click(screen.getByRole("button", { name: "Pedir turno con Carlos Gómez" }));

      expect(screen.getByText(/destino \/pedir-turno/)).toBeInTheDocument();
    });
  });

  describe("dar turno (secretaria)", () => {
    it("abre el modal con el paciente elegido, y al agendar avisa con nombre, día y hora", async () => {
      renderLista("paciente", "SECRETARIA", [paciente(7, "María", "Flores", "35123456")]);

      fireEvent.click(screen.getByRole("button", { name: "Dar turno" }));
      expect(screen.getByText("modal de turno para 7")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "turno creado" }));
      expect(await screen.findByText(/Turno agendado para María el .* a las 10:30/)).toBeInTheDocument();
    });

    it("cerrar el modal lo saca de la pantalla", () => {
      renderLista("paciente", "SECRETARIA", [paciente(7, "María", "Flores", "35123456")]);
      fireEvent.click(screen.getByRole("button", { name: "Dar turno" }));

      fireEvent.click(screen.getByRole("button", { name: "cerrar modal" }));

      expect(screen.queryByText("modal de turno para 7")).not.toBeInTheDocument();
    });
  });

  describe("resumen y descripción según quién mira", () => {
    it("el médico ve cuántos pacientes atendió este mes y la última consulta de cada uno", () => {
      const ahora = new Date().toISOString();
      renderLista("paciente", "MEDICO", [
        paciente(1, "Ana", "Pérez", "1", { ultimaConsulta: ahora }),
        paciente(2, "Beto", "Ríos", "2", { ultimaConsulta: "2000-01-05T10:00:00.000Z" }),
        paciente(3, "Cora", "Sosa", "3", { ultimaConsulta: null }),
      ]);

      expect(screen.getByText("Atendidos este mes")).toBeInTheDocument();
      expect(screen.getByText("Sin consultas")).toBeInTheDocument();
      expect(screen.getByText("Última consulta")).toBeInTheDocument();
      expect(screen.getByText(/Abrí la historia clínica de un paciente/)).toBeInTheDocument();
    });

    it("la secretaria ve cuántos pacientes tienen obra social", () => {
      const conOS = { coberturas: [{ plan: "210", nroAfiliado: "A-1", obraSocial: { nombre: "OSDE" } }] };
      renderLista("paciente", "SECRETARIA", [paciente(1, "Ana", "Pérez", "1", conOS), paciente(2, "Beto", "Ríos", "2")]);

      expect(screen.getByText("Con obra social")).toBeInTheDocument();
      expect(screen.getByText(/Buscá un paciente por nombre o DNI/)).toBeInTheDocument();
      expect(screen.getByText("OSDE")).toBeInTheDocument();
      expect(screen.getByText("Sin obra social")).toBeInTheDocument();
    });

    it("la cartilla cuenta médicos y especialidades distintas", () => {
      renderLista("medico", "PACIENTE", [medico(1, "A", "A", "Cardiología"), medico(2, "B", "B", "Cardiología"), medico(3, "C", "C", "Pediatría")]);

      // "Médicos" es el título de la página y también el dato del resumen (3 médicos)
      const datoMedicos = screen.getAllByText("Médicos").find((el) => el.tagName === "DT")!;
      expect(datoMedicos.nextElementSibling).toHaveTextContent("3");
      expect(screen.getByText("Especialidades").nextElementSibling).toHaveTextContent("2");
      expect(screen.getByText(/pedí turno directamente con quien elijas/)).toBeInTheDocument();
      expect(screen.getAllByText("Lunes a viernes")).toHaveLength(3);
    });

    it("la secretaria ve la cartilla como 'Profesionales' y sin botón de pedir turno", () => {
      renderLista("medico", "SECRETARIA", [medico(1, "A", "A", "Cardiología")]);

      expect(screen.getByRole("heading", { name: "Profesionales" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Pedir turno/ })).not.toBeInTheDocument();
    });
  });
});
