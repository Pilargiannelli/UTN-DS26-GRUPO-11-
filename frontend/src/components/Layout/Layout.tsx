import type { ReactNode } from "react";
import { Container } from "react-bootstrap";
import Header from "./Header.tsx";
import { Footer } from "./Footer.tsx";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Container fluid className="m-0 p-0 d-flex flex-grow-1">
        <Container>{children}</Container>
      </Container>
      <Footer />
    </>
  );
}

export default Layout;