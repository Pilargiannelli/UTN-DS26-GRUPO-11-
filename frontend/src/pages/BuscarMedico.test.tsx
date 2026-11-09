import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("../components/Layout/Layout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("../components/ListarUsuarios", () => ({
  ListarUsuarios: ({ rol }: { rol: string }) => <p>listado de {rol}</p>,
}));

import BuscarMedico from "./BuscarMédico";

describe("BuscarMédico", () => {
  it("muestra el listado de médicos dentro del layout", () => {
    render(<BuscarMedico />);

    expect(screen.getByText("listado de medico")).toBeInTheDocument();
  });
});
