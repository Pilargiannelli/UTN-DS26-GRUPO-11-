import type { ReactNode } from "react";
import { Container } from "react-bootstrap";
import Header from "./Header";
import NavbarLateral from "./NavbarLateral";

interface LayoutProps { children: ReactNode };

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Container fluid className="m-0 p-0 d-flex">
        <NavbarLateral
          opciones={[
            "Turnos",
            "Pacientes",
            "Agenda"
          ]}
        />
        <Container>{children}</Container>
      </Container>
    </>
  );
}

export default Layout;