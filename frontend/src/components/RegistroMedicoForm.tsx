import type { ChangeEvent } from "react";
import type { UseFormRegisterReturn } from "react-hook-form";
import { useForm, type Resolver, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicoSchema, type MedicoValidado } from "../schemas/medicoSchema";
import { Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { useState } from "react";
import { useMayus } from "../hooks/useMayus";
import { apiFetch, ApiError } from "../services/api";
import { useNavigate } from "react-router-dom";
import { ESPECIALIDADES } from "../constants/especialidades";
import "../assets/styles/Form.css";

// Mapeo de errores del backend a los campos del formulario
const CAMPO_FORM: Record<string, Path<MedicoValidado>> = {
    nombre: "nombre",
    apellido: "apellido",
    dni: "dni",
    email: "email",
    especialidad: "especialidad",
    matricula: "matricula",
    password: "password",
};

export function RegistroMedicoForm() {
    const navigate = useNavigate();
    const handleMayus = useMayus();

    // Pasa a mayúsculas y le avisa a react-hook-form
    const conMayusculas = (campo: UseFormRegisterReturn) => ({
        ...campo,
        onChange: (e: ChangeEvent<HTMLInputElement>) => {
            handleMayus(e);
            return campo.onChange(e);
        },
    });

    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const schema = medicoSchema(false); // Modo secretaría: sin validación de contraseña propia

    const { register, handleSubmit, formState: { errors }, setError } = useForm<MedicoValidado>({
        resolver: zodResolver(schema) as Resolver<MedicoValidado>,
        mode: "onBlur",
    });

    const onSubmit = async (data: MedicoValidado) => {
        setSubmitting(true);
        setErrorMsg(null);

        const payload = {
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            email: data.email,
            especialidad: data.especialidad,
            matricula: data.matricula,
        };

        try {
            await apiFetch("/medicos", {
                method: "POST",
                body: JSON.stringify(payload),
            });

            // Redirige al directorio de médicos indicando éxito
            navigate("/buscar-medico", { state: { medicoCreado: true } });
        } catch (err) {
            const detalles = err instanceof ApiError ? err.detalles : [];
            detalles.forEach(({ campo, mensaje }) => {
                const campoForm = CAMPO_FORM[campo];
                if (campoForm) setError(campoForm, { message: mensaje });
            });
            setErrorMsg(err instanceof Error ? err.message : "Error al registrar el médico");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container my-0 form-container">
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

                {/* Datos personales */}
                <Form.Label className="mb-1">Datos personales</Form.Label>
                <Row className="g-3">
                    {/* Nombre */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-medico-nombre">
                            <Form.Label className="d-flex me-auto">Nombre</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Carlos" {...register("nombre")} isInvalid={!!errors.nombre} />
                            <Form.Control.Feedback type="invalid"> {errors.nombre?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Apellido */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-medico-apellido">
                            <Form.Label className="d-flex me-auto">Apellido</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Gómez" {...register("apellido")} isInvalid={!!errors.apellido} />
                            <Form.Control.Feedback type="invalid"> {errors.apellido?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                
                <Row className="g-3">
                    {/* DNI */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-medico-dni">
                            <Form.Label className="d-flex me-auto">DNI</Form.Label>
                            <Form.Control type="text" inputMode="numeric" placeholder="Ej: 30123456" {...register("dni")} isInvalid={!!errors.dni} />
                            <Form.Control.Feedback type="invalid"> {errors.dni?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Contacto */}
                <Form.Label className="mt-2 mb-1">Datos de contacto</Form.Label>
                <Row className="g-3">
                    {/* Email */}
                    <Col md={12}>
                        <Form.Group className="mb-3" controlId="reg-medico-email">
                            <Form.Label className="d-flex me-auto">Email</Form.Label>
                            <Form.Control type="text" inputMode="email" placeholder="Ej: medico@clinica.com" {...register("email")} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Información profesional */}
                <Form.Label className="mt-2 mb-1">Información profesional</Form.Label>
                <Row className="g-3">
                    {/* Especialidad */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-medico-especialidad">
                            <Form.Label className="d-flex me-auto">Especialidad</Form.Label>
                            <Form.Select {...register("especialidad")} isInvalid={!!errors.especialidad} defaultValue="">
                                <option value="" disabled>Seleccione una especialidad</option>
                                {ESPECIALIDADES.map((e) => <option key={e} value={e}>{e}</option>)}
                            </Form.Select>
                            <Form.Control.Feedback type="invalid"> {errors.especialidad?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Matrícula */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-medico-matricula">
                            <Form.Label className="d-flex me-auto">Matrícula</Form.Label>
                            <Form.Control type="text" placeholder="Ej: MP-12345" {...conMayusculas(register("matricula"))} isInvalid={!!errors.matricula} />
                            <Form.Control.Feedback type="invalid"> {errors.matricula?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <p className="text-muted small">
                    El médico va a poder ingresar con su email y su DNI como contraseña inicial.
                </p>

                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting ? <Spinner size="sm" /> : "Registrar médico"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}