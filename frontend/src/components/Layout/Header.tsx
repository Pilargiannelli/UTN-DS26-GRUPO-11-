import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.ts";
import { Sidebar } from "./Sidebar.tsx";
import { useFotoPerfil } from "../../hooks/useFotoPerfil.ts";
import { menuPorRol } from "./menuPorRol.ts";
import '../../assets/styles/Header.css';

function Header() {
  const { usuario, logout, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  const fotoPerfil = useFotoPerfil(usuario?.fotoPerfil ?? undefined);

  const manejarLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar id="colorNav" as="header">
      <Container className="header-container container-fluid">
        <Navbar.Brand className="nav-logo m-0 d-flex align-items-center gap-2">
          {/* En pantallas chicas el menú se abre con ☰; en grandes está fijo al costado (Layout) */}
          {estaAutenticado && usuario && (
            <div className="d-lg-none">
              <Sidebar items={menuPorRol[usuario.rol]} />
            </div>
          )}
          <Link to={estaAutenticado ? "/home" : "/"} aria-label="IMOS, ir al inicio">
            <img src="/IMOS_LOGO.png" width="180" height="180" alt="IMOS" />
          </Link>
        </Navbar.Brand>

        {/* Control de Sesión */}
        <Nav className="ms-auto align-items-center">
          {estaAutenticado && usuario ? (
            <div className="d-flex align-items-center gap-2">
              <span className="header-saludo d-none d-sm-inline">
                Hola, <strong>{usuario.nombre}</strong>
              </span>
              <NavDropdown title={<div {...fotoPerfil} aria-label="Menú de la cuenta" />} id="perfil-dropdown" align="end">
                <NavDropdown.Item className="item" onClick={() => navigate("/mi-cuenta")}>
                  Mi cuenta
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="item" onClick={manejarLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          ) : (
            <Link className="btn btn-outline-success btn-sm" to="/">
              Ingresar
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;
