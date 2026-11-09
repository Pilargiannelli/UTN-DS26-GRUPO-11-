import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Layout trae Header/Sidebar con contexto propio: acá interesa solo el mensaje
vi.mock("../components/Layout/Layout.tsx", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

import NoAutorizado from "./NoAutorizado";

describe("NoAutorizado", () => {
  it("avisa que falta permiso y ofrece volver al inicio", () => {
    render(
      <MemoryRouter>
        <NoAutorizado />
      </MemoryRouter>
    );

    expect(screen.getByText("No tenés permiso para acceder a esta página")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/home");
  });
});
