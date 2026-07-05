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

export function UserCard({usuario, isEditing, onUpdate}: UserCardProps) {
  const { foto, docs, rol } = usuario;
  const fotoPerfil = useFotoPerfil(foto);
  const handleFormSave = (values: unknown) => {
    onUpdate(values as PacienteProps | UserProps | MedicoProps);
  };
  const handleCancel = () => {
    onUpdate(docs as PacienteProps | UserProps | MedicoProps);
  };
  const FormularioEdicionAlternativo = usePerfilRolView(usuario, {
    admin: {
      paciente: (
        <PacienteFormFields onSave={handleFormSave} onCancel={handleCancel} paciente={docs as PacienteProps} />
      ),
      medico: (
        <MedicoFormFields onSave={handleFormSave} onCancel={handleCancel} medico={docs as MedicoProps}/>
      ),
      admin: (
        <AdminFormFields onSave={handleFormSave} onCancel={handleCancel} admin={docs as UserProps}/>
      ),
    },
  });
  return (
    <Card className="user-card shadow-sm m-0">
      <Card.Body className="text-center">
        {isEditing ? ( FormularioEdicionAlternativo ) : (
          <>
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
        </>
        )}
      </Card.Body>
    </Card>
  );
}