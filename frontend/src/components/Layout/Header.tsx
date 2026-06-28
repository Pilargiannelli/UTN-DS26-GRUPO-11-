import { Container, Navbar, Nav, NavDropdown } from "react-bootstrap";
import { useLogout } from "../../hooks/useLogout.ts";
import { useNavigate } from "react-router-dom";
import { useUsuarioSeleccionado } from "../../hooks/useUsuarioSeleccionado.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import { useFotoPerfil } from "../../hooks/useFotoPerfil.ts";
import '../../assets/styles/Header.css'

interface Props {
  rol: string;
}

function Header({ rol }: Props) {
  const { usuario, setUsuario } = useAuth();
  const { seleccionarUsuario } = useUsuarioSeleccionado();
  const fotoPerfil = useFotoPerfil(usuario?.foto);
  const navigate = useNavigate();
  const { logout } = useLogout();
  return (
    <Navbar id = "colorNav">
      <Container className="header-container">
        <Navbar.Brand className="nav-logo m-0">
          <img src="/IMOS_LOGO.png" width="200" height="200" alt="IMOS"/>
        </Navbar.Brand>
        <Nav className="ms-auto">
          <Nav.Link className="link" href={`/home`}>Inicio</Nav.Link>
          <Nav.Link className="link" href="/turnos">Turnos</Nav.Link>

          {/* SOLO MÉDICO */}
          {rol === "medico" && (
            <Nav.Link href="/historial">Historial Clínico</Nav.Link>
          )}

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