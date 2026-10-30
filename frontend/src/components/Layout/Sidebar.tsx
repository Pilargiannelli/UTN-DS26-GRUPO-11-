import { Button, Offcanvas, Nav } from 'react-bootstrap';
import { BoxArrowRight, PersonCircle } from 'react-bootstrap-icons';
import { NavLink } from 'react-router-dom';
import type { SidebarProps } from '../../types/SidebarProps';
import '../../assets/styles/Sidebar.css'
import { useState } from 'react';

// Menú desplegable (☰): arriba las secciones del rol; abajo de todo, separado,
// lo de la cuenta (quién está logueado, Mi cuenta y Cerrar sesión)
export function Sidebar({ items, cuenta }: SidebarProps) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const cerrarSesion = () => {
    handleClose();
    cuenta?.onCerrarSesion();
  };

  return (
    <>
      {/* Botón para abrir el menú */}
      <Button variant="outline-light" onClick={handleShow} className={`menu-button ${show ? 'hidden' : ''}`} aria-label="Abrir menú">
        ☰
      </Button>
      {/* Menú lateral */}
      <Offcanvas show={show} onHide={handleClose} placement="start" scroll={true} backdrop={false}>
        <Offcanvas.Header closeButton closeLabel="Cerrar menú">
          <Offcanvas.Title><img src='/IMOS_LOGO.png' alt='IMOS'/></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="menu-cuerpo">
          <Nav className="flex-column" aria-label="Menú principal">
            {/* NavLink (no href): navega sin recargar la página y marca el link activo */}
            {items.map((item) => (
              <Nav.Link key={item.href} as={NavLink} to={item.href} onClick={handleClose}>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          {cuenta && (
            <div className="menu-cuenta">
              <div className="menu-cuenta-usuario">
                <PersonCircle className="menu-cuenta-icono" aria-hidden="true" />
                <div>
                  <span className="menu-cuenta-nombre">{cuenta.nombre}</span>
                  <span className="menu-cuenta-rol">{cuenta.rol}</span>
                </div>
              </div>
              <Nav className="flex-column" aria-label="Cuenta">
                <Nav.Link as={NavLink} to="/mi-cuenta" onClick={handleClose}>
                  Mi cuenta
                </Nav.Link>
                <button type="button" className="nav-link menu-cerrar-sesion" onClick={cerrarSesion}>
                  <BoxArrowRight aria-hidden="true" /> Cerrar sesión
                </button>
              </Nav>
            </div>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
