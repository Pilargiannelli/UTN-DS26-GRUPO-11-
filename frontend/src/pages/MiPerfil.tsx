import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useAuth } from "../hooks/useAuth";
import { DatosPaciente } from "../components/DatosPaciente.tsx";
import type { PacienteProps } from "../types/PacienteProps.ts";
import "../assets/styles/MiPerfil.css";

function MiPerfil() {
  const { usuario } = useAuth();

  if (!usuario) {
    return (
      <Layout>
        <BotonVolver />
        <p className="text-muted">No hay sesión activa.</p>
      </Layout>
    );
  }

  const docs = usuario.docs as unknown as PacienteProps;
  const iniciales = `${docs.nombre?.[0] ?? ""}${docs.apellido?.[0] ?? ""}`;

  return (
    <Layout>
      <BotonVolver />

      <p className="mi-perfil-titulo">Mi perfil</p>

      <div className="mi-perfil-card">
        <div className="mi-perfil-encabezado">
          <div className="mi-perfil-avatar">{iniciales}</div>
          <div>
            <p className="mi-perfil-nombre">{docs.nombre} {docs.apellido}</p>
            <p className="mi-perfil-rol">Paciente</p>
          </div>
        </div>

        <DatosPaciente docs={docs} />
      </div>
    </Layout>
  );
}

export default MiPerfil;