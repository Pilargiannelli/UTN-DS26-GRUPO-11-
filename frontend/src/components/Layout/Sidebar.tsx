import { Button, Offcanvas, Nav } from 'react-bootstrap';
import type { SidebarProps } from '../../types/SidebarProps';
import '../../assets/styles/Sidebar.css'
import { useState } from 'react';

export function Sidebar({ items }: SidebarProps) {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      {/* Botón para abrir el menú */}
      <Button variant="outline-light" onClick={handleShow} className={`menu-button ${show ? 'hidden' : ''}`}>
        ☰
      </Button>
      {/* Menú lateral */}
      <Offcanvas show={show} onHide={handleClose} placement="start" scroll={true} backdrop={false}>
        <Offcanvas.Header closeButton>
          <Offcanvas.Title><img src='/public/IMOS_LOGO.png' alt='IMOS'/></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav className="flex-column">
            {items.map((item) => (
              <Nav.Link key={item.href} href={item.href}>
                {item.label}
              </Nav.Link>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
