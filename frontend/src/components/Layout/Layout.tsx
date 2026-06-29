import type { ReactNode } from "react";
import { Container } from "react-bootstrap";
import Header from "./Header.tsx";

interface LayoutProps {
  children: ReactNode;
  rol: string;
}

function Layout({ children, rol }: LayoutProps) {

  

  return (
    <>
      <Header rol={rol} />
      <Container fluid className="m-0 p-0 d-flex">
        <Container>{children}</Container>
      </Container>
    </>
  );
}

export default Layout;