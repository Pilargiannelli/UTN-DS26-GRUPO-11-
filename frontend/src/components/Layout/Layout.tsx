import type { ReactNode } from "react";
import { Container } from "react-bootstrap";
import Header from "./Header.tsx";
import { Footer } from "./Footer.tsx";
import { MenuLateral } from "./MenuLateral.tsx";
import { menuPorRol } from "./menuPorRol.ts";
import { useAuth } from "../../hooks/useAuth.ts";
import "../../assets/styles/MenuLateral.css";

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const { usuario } = useAuth();

  return (
    <>
      <Header />
      <div className="layout-cuerpo">
        {usuario && <MenuLateral items={menuPorRol[usuario.rol]} />}
        <main className="layout-contenido">
          <Container>{children}</Container>
        </main>
      </div>
      <Footer />
    </>
  );
}

export default Layout;
