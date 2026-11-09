import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { AvatarIniciales } from "./AvatarIniciales";
import { Boton } from "./Boton";
import { BotonVolver } from "./BotonVolver";
import { ContenedorDatos } from "./ContenedorDatos";
import { ModalConfirmacion } from "./ModalConfirmacion";
import { Migas } from "./Migas";
import ContadorTurnos from "./ContadorTurnos";
import { DesplazadorTabs } from "./DesplazadorTabs";
import { Footer } from "./Layout/Footer";

describe("AvatarIniciales", () => {
  it("muestra las iniciales en mayúscula", () => {
    render(<AvatarIniciales nombre="ana" apellido="pérez" id={1} />);

    expect(screen.getByText("AP")).toBeInTheDocument();
  });

  it("no rompe con nombre o apellido vacíos", () => {
    const { container } = render(<AvatarIniciales nombre="" apellido="Gómez" id={1} />);

    expect(container.textContent).toBe("G");
  });

  it("la misma persona (mismo id) siempre tiene el mismo color", () => {
    const { container: a } = render(<AvatarIniciales nombre="A" apellido="B" id={5} />);
    const { container: b } = render(<AvatarIniciales nombre="C" apellido="D" id={5} />);

    expect(a.firstElementChild?.className).toBe(b.firstElementChild?.className);
  });

  it("aplica el tamaño pedido", () => {
    const { container } = render(<AvatarIniciales nombre="A" apellido="B" id={0} tamanio="xl" />);

    expect(container.firstElementChild).toHaveClass("avatar-iniciales-xl");
  });
});

describe("Boton", () => {
  it("muestra el texto y llama a onClick al hacer click", () => {
    const onClick = vi.fn();
    render(<Boton texto="Guardar" onClick={onClick} />);

    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("BotonVolver", () => {
  function Ubicacion() {
    return <div data-testid="ruta">{useLocation().pathname}</div>;
  }

  function renderVolver(props: { destino?: string }, estado?: { from: string }) {
    render(
      <MemoryRouter initialEntries={[{ pathname: "/actual", state: estado }]}>
        <Routes>
          <Route path="/actual" element={<BotonVolver {...props} />} />
          <Route path="*" element={<Ubicacion />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByRole("button", { name: "Volver" }));
  }

  it("con destino explícito navega a ese destino", () => {
    renderVolver({ destino: "/mis-turnos" });

    expect(screen.getByTestId("ruta")).toHaveTextContent("/mis-turnos");
  });

  it("sin destino vuelve a donde venía si fue /buscar-paciente", () => {
    renderVolver({}, { from: "/buscar-paciente" });

    expect(screen.getByTestId("ruta")).toHaveTextContent("/buscar-paciente");
  });

  it("sin destino vuelve a /buscar-medico si venía de ahí", () => {
    renderVolver({}, { from: "/buscar-medico" });

    expect(screen.getByTestId("ruta")).toHaveTextContent("/buscar-medico");
  });

  it("sin destino ni origen conocido vuelve a /home", () => {
    renderVolver({});

    expect(screen.getByTestId("ruta")).toHaveTextContent("/home");
  });
});

describe("ContenedorDatos", () => {
  it("muestra cada dato como 'label: valor'", () => {
    render(<ContenedorDatos datos={[{ label: "DNI", valor: "30111222" }, { label: "Edad", valor: "35" }]} />);

    expect(screen.getByText("DNI:")).toBeInTheDocument();
    expect(screen.getByText("30111222")).toBeInTheDocument();
    expect(screen.getByText("Edad:")).toBeInTheDocument();
  });

  it("sin datos no dibuja la lista pero sí los hijos", () => {
    const { container } = render(
      <ContenedorDatos>
        <p>contenido</p>
      </ContenedorDatos>
    );

    expect(container.querySelector(".contenedor-datos-lista")).toBeNull();
    expect(screen.getByText("contenido")).toBeInTheDocument();
  });
});

describe("ModalConfirmacion", () => {
  it("cerrado no renderiza nada", () => {
    const { container } = render(
      <ModalConfirmacion isOpen={false} mensaje="¿Seguro?" onAceptar={vi.fn()} onCancelar={vi.fn()} />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("abierto muestra el mensaje y dispara Aceptar y Cancelar por separado", () => {
    const onAceptar = vi.fn();
    const onCancelar = vi.fn();
    render(<ModalConfirmacion isOpen mensaje="¿Seguro?" onAceptar={onAceptar} onCancelar={onCancelar} />);

    expect(screen.getByText("¿Seguro?")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Aceptar" }));
    expect(onAceptar).toHaveBeenCalledTimes(1);
    expect(onCancelar).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(onCancelar).toHaveBeenCalledTimes(1);
  });
});

describe("Migas", () => {
  it("los niveles con destino son links y el último es la página actual", () => {
    render(
      <MemoryRouter>
        <Migas items={[{ texto: "Pacientes", a: "/buscar-paciente" }, { texto: "María Flores" }]} />
      </MemoryRouter>
    );

    expect(screen.getByRole("link", { name: "Pacientes" })).toHaveAttribute("href", "/buscar-paciente");
    expect(screen.queryByRole("link", { name: "María Flores" })).not.toBeInTheDocument();
    expect(screen.getByText("María Flores")).toHaveAttribute("aria-current", "page");
  });
});

describe("ContadorTurnos", () => {
  it("muestra los tres contadores con sus valores", () => {
    render(<ContadorTurnos turnosHoy={4} turnosAtendidos={2} turnosMañana={7} />);

    expect(screen.getByText("Turnos de hoy")).toBeInTheDocument();
    expect(screen.getByText("Atendidos")).toBeInTheDocument();
    expect(screen.getByText("Turnos de mañana")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("sin props arranca los tres en 0", () => {
    render(<ContadorTurnos />);

    expect(screen.getAllByText("0")).toHaveLength(3);
  });
});

describe("DesplazadorTabs", () => {
  const tabs = [
    { label: "Datos", component: <p>panel datos</p> },
    { label: "Turnos", component: <p>panel turnos</p> },
  ];

  it("la primera pestaña arranca activa", () => {
    render(<DesplazadorTabs tabs={tabs} />);

    expect(screen.getByRole("button", { name: "Datos" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "Turnos" })).not.toHaveClass("active");
  });

  it("al hacer click activa la pestaña elegida", () => {
    render(<DesplazadorTabs tabs={tabs} />);

    fireEvent.click(screen.getByRole("button", { name: "Turnos" }));

    expect(screen.getByRole("button", { name: "Turnos" })).toHaveClass("active");
    expect(screen.getByRole("button", { name: "Datos" })).not.toHaveClass("active");
  });
});

describe("Footer", () => {
  it("muestra el nombre del sistema y el copyright", () => {
    render(<Footer />);

    expect(screen.getByText(/Sistema de gestión clínica/)).toBeInTheDocument();
    expect(screen.getByText(/© 2026 IMOS/)).toBeInTheDocument();
  });
});
