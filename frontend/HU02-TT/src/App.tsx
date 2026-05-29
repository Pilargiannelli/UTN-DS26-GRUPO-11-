import { useState } from "react";
import PatientEditForm from "./components/PatientEditForm";
import { Patient } from "./types/patient";

const MOCK_PATIENT: Patient = {
  id: "pac-001",
  dni: "32123456",
  nombre: "",
  apellido: "",
  nacionalidad: "",
  sexo: "",
  fechaNacimiento: "",
  telefono: "",
  email: "",
  direccion: "",
  ciudad: "",
  obraSocial: "",
  numeroAfiliado: "",
  plan: ""
};

export default function App() {
  const [patient, setPatient] = useState<Patient>(MOCK_PATIENT);
  const handleBackClick = () => window.history.back();

  return (
    <>
      <header className="app-header">
        <h1 className="app-header-title">Edicion de paciente</h1>
      </header>

      <div className="app-toolbar">
        <button type="button" className="back-button" onClick={handleBackClick}>
          {"< Volver"}
        </button>
      </div>

      <main className="app-container">
        <PatientEditForm patient={patient} onPatientSaved={setPatient} />

        <section className="patient-preview" aria-live="polite">
          <h3>Datos actuales del paciente</h3>
          <div className="patient-preview-grid">
            <p>
              <strong>Nombre:</strong> {patient.nombre} {patient.apellido}
            </p>
            <p>
              <strong>DNI:</strong> {patient.dni}
            </p>
            <p>
              <strong>Nacionalidad:</strong> {patient.nacionalidad}
            </p>
            <p>
              <strong>Sexo:</strong> {patient.sexo}
            </p>
            <p>
              <strong>Telefono:</strong> {patient.telefono}
            </p>
            <p>
              <strong>Email:</strong> {patient.email}
            </p>
            <p>
              <strong>Direccion:</strong> {patient.direccion}, {patient.ciudad}
            </p>
            <p>
              <strong>Obra social:</strong> {patient.obraSocial || "-"}
            </p>
            <p>
              <strong>Numero de afiliado:</strong> {patient.numeroAfiliado || "-"}
            </p>
            <p>
              <strong>Plan:</strong> {patient.plan || "-"}
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
