import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { PersonCircle } from "react-bootstrap-icons";

interface Props {
  rol: string;
}

function Header({ rol }: Props) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand>IMOS</Navbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href="/">Inicio</Nav.Link>
          <Nav.Link href="/turnos">Turnos</Nav.Link>

          {/* SOLO MÉDICO */}
          {rol === "medico" && (
            <Nav.Link href="/historial">Historial Clínico</Nav.Link>
          )}

          <NavDropdown
            title={<PersonCircle size={24} />}
            id="perfil-dropdown"
            align="end"
          >
            <NavDropdown.Item href="#">Mi cuenta</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item href="#">Cerrar sesión</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;