import { Button, Offcanvas, Nav, Dropdown } from 'react-bootstrap';
import { BoxArrowRight, ChevronUp, Person, PersonCircle, HouseDoor, Calendar3, CalendarWeek, People, HeartPulse, List, CalendarCheck, CalendarPlus } from 'react-bootstrap-icons';
import { Link, NavLink, useLocation } from 'react-router-dom';
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
          {persistente && (
            <div className="reception-sidebar-brand" aria-hidden="true">
              <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round"><path d="M15 4h10v11h11v10H25v11H15V25H4V15h11z" /></svg>
              <span>IMOS</span>
            </div>
          )}
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
          {cuenta && persistente && (
            <Dropdown drop="up" className="reception-sidebar-cuenta">
              <Dropdown.Toggle as="button" type="button" id="reception-sidebar-cuenta" aria-label={`Opciones de cuenta de ${cuenta.nombre}`}>
                <span className="reception-sidebar-avatar" aria-hidden="true">{cuenta.nombre.split(" ").filter(Boolean).map((p, i, a) => (i === 0 || i === a.length - 1) ? p[0] : "").join("").toUpperCase()}</span>
                <span className="reception-sidebar-cuenta-datos"><strong>{cuenta.nombre}</strong><small>{cuenta.rol}</small></span>
                <ChevronUp className="reception-sidebar-cuenta-flecha" aria-hidden="true" />
              </Dropdown.Toggle>
              <Dropdown.Menu popperConfig={{ strategy: "fixed" }}>
                <Dropdown.Item as={Link} to="/mi-cuenta" onClick={handleClose}><Person aria-hidden="true" /> Mi cuenta</Dropdown.Item>
                <Dropdown.Item as="button" className="reception-sidebar-salir" onClick={cerrarSesion}><BoxArrowRight aria-hidden="true" /> Cerrar sesión</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
}
