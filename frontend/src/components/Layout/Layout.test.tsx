import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../../context/AuthContextBase";

vi.mock("./Header.tsx", () => ({
  default: ({ recepcion }: { recepcion: boolean }) => <header>header recepcion={String(recepcion)}</header>,
}));

import Layout from "./Layout";

function renderLayout(usuario: unknown, className?: string) {
  const auth = { usuario } as unknown as AuthContextType;
  return render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <Layout className={className}>
          <p>contenido de la página</p>
        </Layout>
      </MemoryRouter>
    </AuthContext.Provider>
  );
}

describe("Layout", () => {
  it("sin sesión muestra el header público, el contenido y el footer", () => {
    renderLayout(null);

    expect(screen.getByText("header recepcion=false")).toBeInTheDocument();
    expect(screen.getByText("contenido de la página")).toBeInTheDocument();
    expect(screen.getByText(/© 2026 IMOS/)).toBeInTheDocument();
  });

  it("con sesión usa el header de recepción y no muestra el footer", () => {
    renderLayout({ id: 1, rol: "MEDICO" });

    expect(screen.getByText("header recepcion=true")).toBeInTheDocument();
    expect(screen.queryByText(/© 2026 IMOS/)).not.toBeInTheDocument();
  });

  it("con sesión envuelve todo con la clase de recepción y el rol del usuario", () => {
    const { container } = renderLayout({ id: 1, rol: "SECRETARIA" }, "mi-clase");

    const envoltorio = container.firstElementChild as HTMLElement;
    expect(envoltorio).toHaveClass("imos-reception-shell", "mi-clase");
    expect(envoltorio).toHaveAttribute("data-rol", "SECRETARIA");
  });

  it("sin sesión ni className no agrega envoltorio extra", () => {
    const { container } = renderLayout(null);

    expect(container.querySelector("[data-rol]")).toBeNull();
  });
});
