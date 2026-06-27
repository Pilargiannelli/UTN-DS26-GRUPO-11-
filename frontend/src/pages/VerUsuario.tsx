import { useAuth } from "../hooks/useAuth.ts";
import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import type { Usuario } from "../types/Usuario.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { BotonVolver } from "../components/BotónVolver.tsx";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css'

export function VerUsuario() {
  const { rol } = useAuth();
  const { data: usuarios, loading, error } = useFetch<Usuario[]>("/users.json");
  const paciente = usuarios?.find((u) => u.rol === "paciente");
  const vistaPorRol = usePerfilRolView(paciente, {
    admin: {
      paciente: <p>Soy admin viendo paciente</p>,
      medico: <p>Soy admin viendo médico</p>,
    },
    medico: {
      paciente: <p>Soy médico viendo paciente</p>,
    },
    paciente: {
      paciente: <p>Soy paciente viendo paciente</p>,
    },
  });
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error</p>;
  return (
    <Layout rol={rol}>
        <BotonVolver />
        {paciente && <UserCard usuario={paciente} />}
        {vistaPorRol}
    </Layout>
  );
}
