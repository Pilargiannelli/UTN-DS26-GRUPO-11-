import type { ReactNode } from "react";
import { Container } from "react-bootstrap";
import Header from "./Header.tsx";
import { Footer } from "./Footer.tsx";

interface LayoutProps {
  children: ReactNode;
  className?: string;
}

function Layout({ children, className }: LayoutProps) {
  const content = (
    <>
      <Header />
      <Container fluid as="main" className="m-0 p-0 d-flex flex-grow-1">
        <Container>{children}</Container>
      </Container>
      <Footer />
    </>
  );

  return className ? <div className={className}>{content}</div> : content;
}

export default Layout;
