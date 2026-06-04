import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ToastMensaje } from "./NotifyToast.tsx";
import { EspecialidadSelect } from "./EspecialidadSelect.tsx";
import especialidades from "../data/especialidades.ts";
import type { MedicoProps } from "../types/MedicoProps.ts";
import 'bootstrap/dist/css/bootstrap.min.css';
import '../assets/styles/App.css';

export function RegistroMedicoForm() {
  const [formData, setFormData] = useState<MedicoProps>({
    nombre: "",
    apellido: "",
    dni: "",
    email: "",
    especialidad: "",
    matricula: "",
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name] : value });
  };
  const [showToast, setShowToast] = useState(false);
  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setShowToast(true);
  };
  return (
    <div className="container my-0 form-container">
        <ToastMensaje mensaje="Médico registrado correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
        <Form className="container my-5" onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="nombre">
                <Form.Label className="d-flex me-auto">Nombre</Form.Label>
                <Form.Control type="text" name="nombre" id="nombreForm" value={formData.nombre} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="apellido">
                <Form.Label className="d-flex me-auto">Apellido</Form.Label>
                <Form.Control type="text" name="apellido" id="apellidoForm" value={formData.apellido} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="dni">
                <Form.Label className="d-flex me-auto">DNI</Form.Label>
                <Form.Control type="number" name="dni" id="dniForm" className="form-type-number" value={formData.dni} onChange={handleChange} required />
            </Form.Group>
            <Form.Group className="mb-3" controlId="email">
                <Form.Label className="d-flex me-auto">Email</Form.Label>
                <Form.Control type="email" name="email" id="emailForm" value={formData.email} onChange={handleChange} required />
            </Form.Group>
            <EspecialidadSelect especialidades={especialidades} value={formData.especialidad} onChange={handleChange} />
            <Form.Group className="mb-3" controlId="matricula">
                <Form.Label className="d-flex me-auto">Matrícula</Form.Label>
                <Form.Control type="text" name="matricula" id="matriculaForm" value={formData.matricula} onChange={handleChange} required />
            </Form.Group>
            <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary">Registrar</Button>
            </div>
        </Form>
    </div>
    );
}