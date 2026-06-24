import type { ReactNode } from "react";
import { Container } from "react-bootstrap";
import NavbarLateral from "./NavbarLateral";
import Header from "./Header";

interface LayoutProps {
  children: ReactNode;
  rol: string;
}

function Layout({ children, rol }: LayoutProps) {

  const opciones =
    rol === "medico"
      ? ["Turnos", "Agenda", "Historial"]
      : ["Turnos", "Pacientes", "Agenda"];

  return (
    <>
      <Header rol={rol} />
      <Container fluid className="m-0 p-0 d-flex">
        <NavbarLateral opciones={opciones} />
        <Container>{children}</Container>
      </Container>
    </>
  );
}

export default Layout;