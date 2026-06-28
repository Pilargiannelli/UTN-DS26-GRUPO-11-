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
      <Container>
        <Navbar.Brand>IMOS</Navbar.Brand>

        <Nav className="ms-auto">
          <Nav.Link href={`/home`}>Inicio</Nav.Link>
          <Nav.Link href="/turnos">Turnos</Nav.Link>

          {/* SOLO MÉDICO */}
          {rol === "medico" && (
            <Nav.Link href="/historial">Historial Clínico</Nav.Link>
          )}

          <NavDropdown
            title= {<div {...fotoPerfil} />}
            id="perfil-dropdown"
            align="end"
          >
            <NavDropdown.Item onClick={() => {
                if (usuario) {
                  seleccionarUsuario(usuario);
                  navigate("/ver-perfil");
                }
              }}>Mi cuenta</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => { logout(); setUsuario(null); }} >Cerrar sesión</NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
}

export default Header;