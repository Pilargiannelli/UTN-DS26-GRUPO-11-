import { useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Container, Spinner } from "react-bootstrap";
import Layout from "../components/Layout/Layout.tsx";
import { Migas } from "../components/Migas.tsx";
import { BotonVolver } from "../components/BotonVolver.tsx";
import { PanelPacienteMedico } from "../components/Medico/PanelPacienteMedico.tsx";
import { useFetch } from "../hooks/useFetch.ts";
import { useAuth } from "../hooks/useAuth.ts";
import type { CoberturaPaciente, Usuario } from "../types/Usuario.ts";
import VerUsuario from "./VerUsuario.tsx";
import "../assets/styles/Perfil.css";

// Respuesta de GET /api/pacientes/:id
interface PacienteDetalle {
  id: number;
  usuarioId: number;
  fechaNacimiento: string;
  sexo: string;
  telefono: string;
  coberturas: CoberturaPaciente[];
  usuario: { id: number; username: string; nombre: string; apellido: string; email: string; dni: string };
}

const aUsuario = (p: PacienteDetalle): Usuario => ({
  ...p.usuario,
  fotoPerfil: null,
  rol: "PACIENTE",
  paciente: {
    id: p.id,
    usuarioId: p.usuarioId,
    fechaNacimiento: p.fechaNacimiento,
    sexo: p.sexo,
    telefono: p.telefono,
    coberturas: p.coberturas,
  },
});

// /pacientes/:id: la ficha de un paciente, con su propia dirección (se puede
// recargar o compartir) y la ruta "Pacientes › Nombre". El médico ve la ficha
// clínica completa; la secretaria, los datos para administrar y dar turnos.
function FichaPaciente() {
  const { id } = useParams();
  const { tieneRol } = useAuth();
  const { data, loading, error } = useFetch<PacienteDetalle>(`/pacientes/${id}`);
  // Lo que guardó la secretaria pisa a lo que vino del GET
  const [actualizado, setActualizado] = useState<Usuario | null>(null);

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-5">
          <Spinner animation="border" role="status" aria-label="Cargando paciente" />
        </div>
      </Layout>
    );
  }

  if (error || !data) {
    return (
      <Layout>
        <Container className="perfil">
          <Migas items={[{ texto: "Pacientes", a: "/buscar-paciente" }, { texto: "Paciente" }]} />
          <Alert variant="danger">{error?.message ?? "No encontramos este paciente."}</Alert>
        </Container>
      </Layout>
    );
  }

  const usuario = actualizado ?? aUsuario(data);
  const migas = (
    <Migas items={[{ texto: "Pacientes", a: "/buscar-paciente" }, { texto: `${usuario.nombre} ${usuario.apellido}` }]} />
  );

  if (tieneRol("MEDICO")) {
    return (
      <Layout>
        <Container className="perfil perfil-medico">
          {/* Por si se abrió la historia del paciente equivocado: vuelve al listado */}
          <BotonVolver destino="/buscar-paciente" />
          {migas}
          <PanelPacienteMedico usuario={usuario} paciente={usuario.paciente!} />
        </Container>
      </Layout>
    );
  }

  return <VerUsuario perfilPaciente={usuario} migas={migas} onPerfilActualizado={setActualizado} />;
}

export default FichaPaciente;
