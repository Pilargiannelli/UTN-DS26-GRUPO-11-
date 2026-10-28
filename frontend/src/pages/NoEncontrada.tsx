import { Link } from "react-router-dom";
import Layout from "../components/Layout/Layout.tsx";
import { useAuth } from "../hooks/useAuth";
import "../assets/styles/NoEncontrada.css";

// Ruta comodín (path="*" en App.tsx): cualquier URL que no exista cae acá
// en vez de dejar la pantalla en blanco.
function NoEncontrada() {
  const { estaAutenticado } = useAuth();

  return (
    <Layout>
      <section className="no-encontrada">
        <p className="no-encontrada-codigo" aria-hidden="true">404</p>
        <h1 className="no-encontrada-titulo">No encontramos esta página</h1>
        <p className="no-encontrada-texto">
          Puede que el enlace esté mal escrito o que la página ya no exista.
        </p>
        <Link className="no-encontrada-btn" to={estaAutenticado ? "/home" : "/"}>
          {estaAutenticado ? "Volver al inicio" : "Ir a ingresar"}
        </Link>
      </section>
    </Layout>
  );
}

export default NoEncontrada;
