import { Container, Navbar, Nav } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.ts";
import { Sidebar } from "./Sidebar.tsx";
import { menuPorRol } from "./menuPorRol.ts";
import '../../assets/styles/Header.css';

const NOMBRE_ROL = { SECRETARIA: "Secretaría", MEDICO: "Médico", PACIENTE: "Paciente" } as const;

// Header: menú (☰) y logo. La cuenta (Mi cuenta, Cerrar sesión) vive al final
// del menú, no acá arriba.
function Header() {
  const { usuario, logout, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  const manejarLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar id="colorNav" as="header">
      <Container className="header-container container-fluid">
        <Navbar.Brand className="nav-logo m-0 d-flex align-items-center gap-2">
          {estaAutenticado && usuario && (
            <Sidebar
              items={menuPorRol[usuario.rol]}
              cuenta={{
                nombre: `${usuario.nombre} ${usuario.apellido}`,
                rol: NOMBRE_ROL[usuario.rol],
                onCerrarSesion: manejarLogout,
              }}
            />
          )}
          <Link to={estaAutenticado ? "/home" : "/"} aria-label="IMOS, ir al inicio">
            <img src="/IMOS_LOGO.png" width="180" height="180" alt="IMOS" />
          </Link>
        </Navbar.Brand>

        {!estaAutenticado && (
          <Nav className="ms-auto align-items-center">
            <Link className="btn btn-outline-success btn-sm" to="/">
              Ingresar
            </Link>
          </Nav>
        )}
      </Container>
    </Navbar>
  );
}

export default Header;
