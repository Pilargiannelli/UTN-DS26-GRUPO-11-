import { useEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import Header from "./Header.tsx";
import { Footer } from "./Footer.tsx";
import { useAuth } from "../../hooks/useAuth";
import "../../assets/styles/ReceptionLayout.css";
import "../../assets/styles/ReceptionTheme.css";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

function Layout({ children, className }: LayoutProps) {
  const { usuario } = useAuth();
  const { pathname } = useLocation();
  const contenidoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Opacidad solamente: preserva el estado y la posicion de los controles.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const entrada = contenidoRef.current?.animate?.(
      [{ opacity: .72 }, { opacity: 1 }],
      { duration: 180, easing: 'cubic-bezier(.2, .7, .3, 1)' },
    );
    return () => entrada?.cancel();
  }, [pathname]);
  const recepcion = !!usuario;
  const clases = [className, recepcion ? "imos-reception-shell" : ""].filter(Boolean).join(" ");
  const content = (
    <>
      <Header recepcion={recepcion} />
      <Container fluid as="main" className="m-0 p-0 d-flex flex-grow-1">
        <Container ref={contenidoRef}>{children}</Container>
      </Container>
      {!recepcion && <Footer />}
    </>
  );

  return clases ? <div className={clases} data-rol={usuario?.rol}>{content}</div> : content;
}

export default Layout;
