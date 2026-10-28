import { Card } from "react-bootstrap";
import { DatosPaciente } from "./DatosPaciente.tsx";
import { DatosMedico } from "./DatosMedico.tsx";
import type { UserCardProps } from "../types/UserCardProps.ts";
import { useFotoPerfil } from "../hooks/useFotoPerfil";
import { usePerfilRolView } from "../hooks/usePerfilRolView.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../assets/styles/UserCard.css";
import { PacienteFormFields } from "./PacienteFormFields.tsx";
import { MedicoFormFields } from "./MedicoFormFields.tsx";
import { AdminFormFields } from "./AdminFormFields.tsx";
import type { PacienteProps } from "../types/PacienteProps.ts";
import type { UserProps } from "../types/UserProps.ts";
import type { MedicoProps } from "../types/MedicoProps.ts";

export function UserCard({ usuario, isEditing, onUpdate }: UserCardProps) {
  // Extraemos directamente del modelo Usuario de Prisma
  const { fotoPerfil, rol, medico, paciente, nombre, apellido, dni, email } = usuario;

  const fotoPerfilHook = useFotoPerfil(fotoPerfil);

  const handleFormSave = (values: unknown) => {
    onUpdate(values as PacienteProps | UserProps | MedicoProps);
  };

  const handleCancel = () => {
    onUpdate(usuario as unknown as PacienteProps | UserProps | MedicoProps);
  };

  const FormularioEdicionAlternativo = usePerfilRolView(usuario, {
    admin: {
      PACIENTE: (
        <PacienteFormFields onSave={handleFormSave} onCancel={handleCancel} paciente={paciente as unknown as PacienteProps} />
      ),
      MEDICO: (
        <MedicoFormFields onSave={handleFormSave} onCancel={handleCancel} medico={medico as unknown as MedicoProps}/>
      ),
      SECRETARIA: (
        <AdminFormFields onSave={handleFormSave} onCancel={handleCancel} admin={usuario as unknown as UserProps}/>
      ),
    },
  });

  return (
    <Card className="user-card shadow-sm m-0">
      <Card.Body className="text-center">
        {isEditing ? ( 
          FormularioEdicionAlternativo 
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
              {rol === "PACIENTE" && paciente && <DatosPaciente docs={paciente as unknown as PacienteProps} />}
              {rol === "MEDICO" && medico && <DatosMedico docs={medico as unknown as MedicoProps} />}
            </div>
          </>
        )}
      </Card.Body>
    </Card>
  );
}