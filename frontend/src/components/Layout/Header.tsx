import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.ts";
import { Sidebar } from "./Sidebar.tsx";
import { useFotoPerfil } from "../../hooks/useFotoPerfil.ts";
import { useRolView } from "../../hooks/useRolView.ts";
import '../../assets/styles/Header.css';

function Header() {
  const { usuario, logout, estaAutenticado, tieneRol } = useAuth();
  const navigate = useNavigate();

  // Cambiamos usuario.foto por usuario.fotoPerfil
  const fotoPerfil = useFotoPerfil(usuario?.fotoPerfil ?? undefined);

  // Menús para el Sidebar
  const menuItemsAdmin = [
    { label: "Gestión de Turnos", href: "/home" },
    { label: 'Pacientes', href: '/buscar-paciente' },
    { label: 'Médicos', href: '/buscar-medico' },
  ];

  const menuItemsMed = [
    { label: "Gestión de Turnos", href: "/home" },
    { label: 'Pacientes', href: '/buscar-paciente' },
    { label: 'Agenda', href: '/orden-del-dia' },
    { label: 'Historial Clínico', href: '/historial' },
  ];

  const itemsPaciente = [
    { label: "Inicio", href: "/home" },
  ];

  // Vista según el rol del enum de Prisma
  const vistaPorRol = useRolView({
    admin: <Sidebar items={menuItemsAdmin} />,
    medico: <Sidebar items={menuItemsMed} />,
    paciente: <Sidebar items={itemsPaciente} />,
  });

  const manejarLogout = () => {
    logout();
    navigate("/login");
  };

  const irAMiPerfil = () => {
    if (usuario) {
      localStorage.setItem("usuarioSeleccionado", JSON.stringify(usuario));
      navigate("/ver-perfil");
    }
  };

  return (
    <Navbar id="colorNav">
      <Container className="header-container container-fluid">
        <Navbar.Brand className="nav-logo m-0 d-flex align-items-center gap-2">
          {estaAutenticado && vistaPorRol}
          <img src="/IMOS_LOGO.png" width="180" height="180" alt="IMOS" />
        </Navbar.Brand>

        {/* Autorización UI: link visible solo para SECRETARIA (rol administrativo) */}
        <Nav className="me-auto ms-3 d-none d-md-flex">
          {tieneRol("SECRETARIA") && (
            <Link className="nav-link text-white" to="/obras-sociales/nueva">
              + Nueva Obra Social
            </Link>
          )}
        </Nav>

        {/* Control de Sesión */}
        <Nav className="ms-auto align-items-center">
          {estaAutenticado && usuario ? (
            <div className="d-flex align-items-center gap-2">
              <span className="text-white d-none d-sm-inline">
                Hola, <strong>{usuario.nombre}</strong>
              </span>
              <NavDropdown title={<div {...fotoPerfil} />} id="perfil-dropdown" align="end">
                <NavDropdown.Item className="item" onClick={irAMiPerfil}>
                  Mi cuenta
                </NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item className="item" onClick={manejarLogout}>
                  Cerrar sesión
                </NavDropdown.Item>
              </NavDropdown>
            </div>
          ) : (
            <Link className="btn btn-outline-light btn-sm" to="/login">
              Ingresar
            </Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;