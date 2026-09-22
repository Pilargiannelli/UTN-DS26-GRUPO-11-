import { Link } from "react-router-dom";
import { Alert } from "react-bootstrap";
import Layout from "../components/Layout/Layout.tsx";

function NoAutorizado() {
  return (
    <Layout>
      <Alert variant="warning" className="mt-5 text-center">
        <Alert.Heading>No tenés permiso para acceder a esta página</Alert.Heading>
        <p className="mb-0">
          Tu usuario no tiene el rol necesario para esta sección.{" "}
          <Link to="/home">Volver al inicio</Link>
        </p>
      </Alert>
    </Layout>
  );
}

export default NoAutorizado;
