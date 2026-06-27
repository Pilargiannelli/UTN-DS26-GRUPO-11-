import { Card } from "react-bootstrap";
import { DatosPaciente } from "./DatosPaciente.tsx";
import { DatosMedico } from "./DatosMedico.tsx";
import type { Usuario } from "../types/Usuario.ts";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/App.css"
import "../assets/styles/UserCard.css";

export function UserCard({ usuario }: { usuario: Usuario }) {
  const { foto, docs, rol } = usuario;
  const fotoPerfil = useFotoPerfil(foto);
  return (
    <Card className="user-card shadow-sm m-5">
      <Card.Body className="text-center">
        {/* Foto */}
        <div {...fotoPerfil} />
        {/* Nombre */}
        <Card.Title className="user-card-nombre">
          {docs.nombre} {docs.apellido}
        </Card.Title>
        {/* Datos comunes */}
        <div className="user-card-datos">
            <div className="dato">
                <h5>DNI:</h5>
                <p>{docs.dni}</p>
            </div>
            <div className="dato">
                <h5>Email:</h5>
                <p>{docs.email}</p>
            </div>
            {/* Datos específicos */}
            {rol === "paciente" && <DatosPaciente docs={docs} />}
            {rol === "medico" && <DatosMedico docs={docs} />}
        </div>
      </Card.Body>
    </Card>
  );
}