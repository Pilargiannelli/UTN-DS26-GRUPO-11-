import { Card } from "react-bootstrap";
import { DatosPaciente } from "./DatosPaciente.tsx";
import { DatosMedico } from "./DatosMedico.tsx";
import type { UserCardProps } from "../types/UserCardProps.ts";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/UserCard.css";
import { PacienteFormFields } from "./PacienteFormFields.tsx";

// Solo los perfiles de PACIENTE se editan (PUT /api/pacientes/:id). Médicos y
// secretarias no tienen endpoint de edición en esta versión.
export function UserCard({ usuario, isEditing, onUpdate, onEditingChange }: UserCardProps) {
  const { fotoPerfil, rol, medico, paciente, nombre, apellido, dni, email } = usuario;

  const fotoPerfilHook = useFotoPerfil(fotoPerfil);

  return (
    <Card className="user-card shadow-sm m-0">
      <Card.Body className="text-center">
        {isEditing && rol === "PACIENTE" && paciente ? (
          <PacienteFormFields usuario={usuario} onSave={onUpdate} onCancel={() => onEditingChange(false)} />
        ) : (
          <>
            {/* Foto */}
            <div {...fotoPerfilHook} />
            {/* Nombre */}
            <Card.Title className="user-card-nombre">
              {nombre} {apellido}
            </Card.Title>
            {/* Datos comunes del Usuario */}
            <div className="user-card-datos">
              <div className="dato">
                <h5>DNI:</h5>
                <p>{dni}</p>
              </div>
              <div className="dato">
                <h5>Email:</h5>
                <p>{email}</p>
              </div>
              {/* Datos específicos según el Enum Rol de Prisma */}
              {rol === "PACIENTE" && paciente && <DatosPaciente docs={paciente} />}
              {rol === "MEDICO" && medico && <DatosMedico docs={medico} />}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}
