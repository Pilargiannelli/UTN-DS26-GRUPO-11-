import type { ReactNode } from "react";
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
  const recepcion = !!usuario;
  const clases = [className, recepcion ? "imos-reception-shell" : ""].filter(Boolean).join(" ");
  const content = (
    <>
      <Header recepcion={recepcion} />
      <Container fluid as="main" className="m-0 p-0 d-flex flex-grow-1">
        <Container>{children}</Container>
      </Container>
      {!recepcion && <Footer />}
    </>
  );

  return clases ? <div className={clases} data-rol={usuario?.rol}>{content}</div> : content;
}

export default Layout;
