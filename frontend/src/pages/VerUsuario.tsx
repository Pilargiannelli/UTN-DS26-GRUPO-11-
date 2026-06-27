import { useAuth } from "../hooks/useAuth.ts";
import Layout from "../components/Layout/Layout.tsx";
import { UserCard } from "../components/UserCard.tsx";
import type { Usuario } from "../types/Usuario.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { BotonVolver } from "../components/BotónVolver.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css'

export function VerUsuario() {
  const { rol } = useAuth();
  const { data: usuarios, loading, error } = useFetch<Usuario[]>("/users.json");
  if (loading) return <p>Cargando...</p>;
  if (error) return <p>Error</p>;
  const paciente = usuarios?.find((u) => u.rol === "paciente");
  return (
    <Layout rol={rol}>
        <BotonVolver />
        {paciente && <UserCard usuario={paciente} />}
    </Layout>
  );
}
