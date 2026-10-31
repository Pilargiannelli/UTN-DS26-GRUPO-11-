import { Button, Offcanvas, Nav } from 'react-bootstrap';
import { BoxArrowRight, PersonCircle, HouseDoor, Calendar3, CalendarWeek, People, HeartPulse, List, CalendarCheck, CalendarPlus } from 'react-bootstrap-icons';
import { NavLink, useLocation } from 'react-router-dom';
import type { SidebarProps } from '../../types/SidebarProps';
import '../../assets/styles/Sidebar.css'
import { useState } from 'react';

// Menú desplegable (☰): arriba las secciones del rol; abajo de todo, separado,
// lo de la cuenta (quién está logueado, Mi cuenta y Cerrar sesión)
export function Sidebar({ items, cuenta, persistente = false }: SidebarProps) {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const cerrarSesion = () => {
    handleClose();
    cuenta?.onCerrarSesion();
  };

  const enlaces = items;
  const iconos: Record<string, typeof HouseDoor> = { "/home": HouseDoor, "/gestion-turnos": Calendar3, "/orden-del-dia": CalendarWeek, "/buscar-paciente": People, "/buscar-medico": HeartPulse, "/mis-turnos": CalendarCheck, "/pedir-turno": CalendarPlus };

  return (
    <>
      {/* Botón para abrir el menú */}
      <Button variant="outline-light" onClick={handleShow} className={`menu-button ${persistente ? 'reception-menu-toggle' : ''} ${show ? 'hidden' : ''}`} aria-label="Abrir menú">
        <List aria-hidden="true" />
      </Button>
      {/* Menú lateral */}
      <Offcanvas show={show} onHide={handleClose} placement="start" scroll={!persistente} backdrop={persistente} responsive={persistente ? "lg" : undefined} className={persistente ? "reception-sidebar" : undefined}>
        <Offcanvas.Header closeButton closeLabel="Cerrar menú" className={persistente ? "d-lg-none" : undefined}>
          <Offcanvas.Title><img src='/IMOS_LOGO.png' alt='IMOS'/></Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="menu-cuerpo">
          <Nav className="flex-column" aria-label="Menú principal">
            {/* NavLink (no href): navega sin recargar la página y marca el link activo */}
            {enlaces.map((item) => (
              <Nav.Link key={item.href} as={NavLink} to={item.href} className={persistente && ((item.href === "/buscar-paciente" && (pathname.startsWith("/pacientes/") || pathname === "/registrar-paciente")) || (item.href === "/buscar-medico" && pathname === "/ver-perfil") || (item.href === "/mis-turnos" && pathname.startsWith("/turnos/"))) ? "active" : undefined} end={item.href === "/home"} onClick={handleClose}>
                {persistente && (() => { const Icono = iconos[item.href] ?? Calendar3; return <Icono aria-hidden="true" />; })()}
                {item.label}
              </Nav.Link>
            ))}
          </Nav>

          {cuenta && !persistente && (
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
