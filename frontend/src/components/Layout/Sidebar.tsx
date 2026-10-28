import { Button, Offcanvas, Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import type { SidebarProps } from '../../types/SidebarProps';
import '../../assets/styles/Sidebar.css'
import { useState } from 'react';

// Menú desplegable para pantallas chicas (en grandes se usa MenuLateral)
export function Sidebar({ items }: SidebarProps) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
        <Offcanvas.Body>
          <Nav className="flex-column" aria-label="Menú principal">
            {/* NavLink (no href): navega sin recargar la página y marca el link activo */}
            {items.map((item) => (
              <Nav.Link key={item.href} as={NavLink} to={item.href} onClick={handleClose}>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
