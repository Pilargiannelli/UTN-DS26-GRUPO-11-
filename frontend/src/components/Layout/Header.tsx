import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useLogout } from "../../hooks/useLogout.ts";
import { useNavigate } from "react-router-dom";
import { useUsuarioSeleccionado } from "../../hooks/useUsuarioSeleccionado.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { Sidebar } from "./Sidebar.tsx";
import { useFotoPerfil } from "../../hooks/useFotoPerfil.ts";
import { useRolView } from "../../hooks/useRolView.ts";
import '../../assets/styles/Header.css'

function Header() {
  const menuItemsAdmin = [
    { label: "Inicio", href: "/home" },
    { label: "Gestión de Turnos", href: "/gestion-turnos" },
    { label: 'Pacientes', href: '/buscar-paciente' },
    { label: 'Médicos', href: '/buscar-medico' },
  ];
  const menuItemsMed = [
    { label: "Inicio", href: "/home" },
    { label: "Gestión de Turnos", href: "/gestion-turnos" },
    { label: 'Pacientes', href: '/buscar-paciente' },
    { label: 'Agenda', href: '/orden-del-dia' },
    { label: 'Historial Clínico', href: '/historial' },
  ];
  const itemsPaciente = [
    { label: "Inicio", href: "/home" },
    { label: "Turnos", href: "/gestion-turnos" },
  ];
  const { usuario, setUsuario } = useAuth();
  const { seleccionarUsuario } = useUsuarioSeleccionado();
  const fotoPerfil = useFotoPerfil(usuario?.foto);
  const navigate = useNavigate();
  const { logout } = useLogout();
  const vistaPorRol = useRolView({
    admin: <Sidebar items={menuItemsAdmin} />,
    medico: <Sidebar items={menuItemsMed} />,
    paciente: <Sidebar items={itemsPaciente} />,
  });
  return (
    <Navbar id = "colorNav">
      <Container className="header-container container-fluid">
        <Navbar.Brand className="nav-logo m-0">
          {vistaPorRol}
          <img src="/IMOS_LOGO.png" width="180" height="180" alt="IMOS"/>
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link className="link" href={`/home`}>Inicio</Nav.Link>
          <Nav.Link className="link" href="/gestion-turnos"> Turnos </Nav.Link>
          <NavDropdown title= {<div {...fotoPerfil} />} id="perfil-dropdown" align="end">
            <NavDropdown.Item className="item" onClick={() => {
                if (usuario) {
                  seleccionarUsuario(usuario);
                  navigate("/ver-perfil");
                }
              }}>Mi cuenta</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item className="item" onClick={() => { logout(); setUsuario(null); }} >Cerrar sesión</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;