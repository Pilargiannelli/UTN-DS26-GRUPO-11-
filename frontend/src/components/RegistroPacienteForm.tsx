import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { ToastMensaje } from "./NotifyToast";
import type { PacienteProps } from "../types/PacienteProps";
interface RegistroPacienteFormProps {
    esAutoregistro: boolean;
}
export function RegistroPacienteForm({
esAutoregistro,
}: RegistroPacienteFormProps) {
const [formData, setFormData] = useState<PacienteProps>({
    nombre: "",
    apellido: "",
    dni: "",
    telefono: "",
    obraSocial: "",
    email: "",
    password: "",
});
const [showToast, setShowToast] = useState(false);
const [mensajeError, setMensajeError] = useState("");
const dnisExistentes = [
    "12345678",
    "87654321",
];
const emailsExistentes = [
    "test@test.com",
];
const handleChange = (
    e: React.ChangeEvent<
    HTMLInputElement |
    HTMLTextAreaElement |
    HTMLSelectElement
    >
) => {
    const { name, value } = e.target;
    setFormData({
    ...formData,
    [name]: value,
    });
};
const handleSubmit = (
    e: React.SyntheticEvent<HTMLFormElement>
) => {
    e.preventDefault();
    console.log(formData.dni);
    setMensajeError("");
    if (
    !formData.nombre ||
    !formData.apellido ||
    !formData.dni ||
    !formData.telefono
    ) {
    setMensajeError(
        "Complete todos los campos obligatorios"
    );
    return;
    }
    if (
    dnisExistentes.includes(formData.dni)
    ) {
    setMensajeError(
        "El DNI ya se encuentra registrado"
    );
    return;
    }
    const telefonoRegex = /^\+\d{10,15}$/;
    if (
    !telefonoRegex.test(
        formData.telefono
    )
    ) {
    setMensajeError(
        "Ingrese un teléfono válido con código de país"
    );
    return;
    }
    if (esAutoregistro) {
    if (
        emailsExistentes.includes(
        formData.email
        )
    ) {
        setMensajeError(
        "Ese email ya está en uso"
        );
        return;
    }
    if (
        formData.password.length < 8
    ) {
        setMensajeError(
        "La contraseña debe tener al menos 8 caracteres"
        );
        return;
    }
    }
    setShowToast(true);
};
return (
    <div className="container my-0 form-container">
    <ToastMensaje
        mensaje={
        esAutoregistro
            ? "Cuenta creada correctamente"
            : "Paciente registrado correctamente"
        }
        tipo="toast-good"
        mostrar={showToast}
        onClose={() => setShowToast(false)}
    />
    <Form
        className="container my-5"
        onSubmit={handleSubmit}
    >
        <Form.Group className="mb-3">
        <Form.Label>
            Nombre
        </Form.Label>
        <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
        />
        </Form.Group>
        <Form.Group className="mb-3">
        <Form.Label>
            Apellido
        </Form.Label>
        <Form.Control
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            required
        />
        </Form.Group>
        <Form.Group className="mb-3">
        <Form.Label>
            DNI
        </Form.Label>
        <Form.Control
            type="number"
            name="dni"
            value={formData.dni}
            onChange={handleChange}
            required
        />
        </Form.Group>
        <Form.Group className="mb-3">
        <Form.Label>
            Teléfono
        </Form.Label>
        <Form.Control
            type="text"
            name="telefono"
            placeholder="+5492215555555"
            value={formData.telefono}
            onChange={handleChange}
            required
        />
        </Form.Group>
        <Form.Group className="mb-3">
        <Form.Label>
            Obra Social
        </Form.Label>
        <Form.Control
            type="text"
            name="obraSocial"
            value={formData.obraSocial}
            onChange={handleChange}
        />
        </Form.Group>
        {esAutoregistro && (
        <>
            <Form.Group className="mb-3">
            <Form.Label>
                Email
            </Form.Label>
            <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
            />
            </Form.Group>
            <Form.Group className="mb-3">
            <Form.Label>
                Contraseña
            </Form.Label>
            <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
            />
            </Form.Group>
        </>
        )}
        {mensajeError && (
        <div className="text-danger mb-3">
            {mensajeError}
        </div>
        )}
        <div className="d-flex justify-content-end">
        <Button
            type="submit"
            variant="primary"
        >
            Registrar
        </Button>
        </div>
    </Form>
    </div>
);
}