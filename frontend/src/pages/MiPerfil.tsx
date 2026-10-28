import Layout from "../components/Layout/Layout.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { useAuth } from "../hooks/useAuth";
import { DatosPaciente } from "../components/DatosPaciente.tsx";
import { DatosMedico } from "../components/DatosMedico.tsx";
import type { PacienteProps } from "../types/PacienteProps.ts";
import type { MedicoProps } from "../types/MedicoProps.ts";
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

  // Extraemos directamente de la entidad Usuario normalizada de Prisma
  const { nombre, apellido, rol, paciente, medico, email, dni } = usuario;
  const iniciales = `${nombre?.[0] ?? ""}${apellido?.[0] ?? ""}`;
  const rolNormalizado = rol?.toUpperCase();

  return (
    <Layout>
      <BotonVolver />

      <p className="mi-perfil-titulo">Mi perfil</p>

      <div className="mi-perfil-card shadow-sm p-4">
        <div className="mi-perfil-encabezado d-flex align-items-center gap-3 mb-3">
          <div className="mi-perfil-avatar">{iniciales}</div>
          <div>
            <p className="mi-perfil-nombre fw-bold fs-5 mb-0">{nombre} {apellido}</p>
            <p className="mi-perfil-rol text-muted mb-0">{rol}</p>
          </div>
        </div>

        <div className="mi-perfil-datos">
          <p><strong>DNI:</strong> {dni || "No especificado"}</p>
          <p><strong>Email:</strong> {email || "No especificado"}</p>

          {/* Renderizado condicional según el rol de Prisma */}
          {rolNormalizado === "PACIENTE" && paciente && (
            <DatosPaciente docs={paciente as unknown as PacienteProps} />
          )}
          {rolNormalizado === "MEDICO" && medico && (
            <DatosMedico docs={medico as unknown as MedicoProps} />
          )}
          {rolNormalizado === "SECRETARIA" && (
            <p><strong>Perfil:</strong> Secretaría / Administrativo</p>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default MiPerfil;