import { Container, Navbar, Nav, Dropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.ts";
import { Sidebar } from "./Sidebar.tsx";
import { menuPorRol, menuLateralPorRol } from "./menuPorRol.ts";
import '../../assets/styles/Header.css';

const NOMBRE_ROL = { SECRETARIA: "Secretaría", MEDICO: "Médico", PACIENTE: "Paciente" } as const;

// El layout autenticado comparte el perfil superior y selecciona el menú de su rol.
function Header({ recepcion = false }: { recepcion?: boolean }) {
  const { usuario, logout, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  const manejarLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar id="colorNav" as="header" className={recepcion ? "reception-header" : undefined}>
      <Container className="header-container container-fluid">
        <Navbar.Brand className="nav-logo m-0 d-flex align-items-center gap-2">
          {estaAutenticado && usuario && (
            <Sidebar
              items={(recepcion ? menuLateralPorRol : menuPorRol)[usuario.rol]}
              persistente={recepcion}
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

        {recepcion && usuario && (
          <Dropdown align="end" className="reception-profile">
            <Dropdown.Toggle id="reception-profile" variant="light" aria-label={`Cuenta de ${usuario.nombre} · ${NOMBRE_ROL[usuario.rol]}`}>
              <span className="reception-avatar" aria-hidden="true">{usuario.nombre.slice(0, 1)}{usuario.apellido.slice(0, 1)}</span>
              <span className="reception-profile-copy"><strong>{usuario.nombre}</strong><small>{NOMBRE_ROL[usuario.rol]}</small></span>
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item as={Link} to="/mi-cuenta">Mi cuenta</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as="button" onClick={manejarLogout}>Cerrar sesión</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        )}
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
