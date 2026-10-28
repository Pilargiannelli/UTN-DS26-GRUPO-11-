import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectEditable } from "./SelectEditable.tsx";
import { medicoSchema, type MedicoValidado } from "../schemas/medicoSchema.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { useMayus } from "../hooks/useMayus.ts";
import { apiFetch } from "../services/api.ts";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function RegistroMedicoForm() {
    const navigate = useNavigate();
    const handleMayus = useMayus();
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Carga de especialidades desde la API real
    const { data: especialidadesAPI, loading } = useFetch<string[]>("/especialidades");
    const espValidas = especialidadesAPI ?? [""];

    // Schema sin dependencia de usuariosDB.json mockeado
    const schema = medicoSchema(espValidas, []);

    const { register, handleSubmit, formState: { errors } } = useForm<MedicoValidado>({
        resolver: zodResolver(schema) as Resolver<MedicoValidado>,
        mode: "onBlur",
    });

    const onSubmit = async (data: MedicoValidado) => {
        setSubmitting(true);
        setErrorMsg(null);
        try {
            const payload = {
                ...data,
                dni: Number(data.dni),
                rol: "MEDICO"
            };

            // Petición real al backend mediante apiFetch
            await apiFetch("/medicos", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            navigate("/buscar-medico");
        } catch (err) {
            setErrorMsg(err instanceof Error ? err.message : "Error al registrar el médico");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <Spinner animation="border" />;

    return (
        <div className="container my-0 form-container">
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}
                
                <Row className="g-3">
                    {/* Nombre */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Nombre</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Sara" {...register("nombre")} isInvalid={!!errors.nombre} />
                            <Form.Control.Feedback type="invalid"> {errors.nombre?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Apellido */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Apellido</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Hernández" {...register("apellido")} isInvalid={!!errors.apellido} />
                            <Form.Control.Feedback type="invalid"> {errors.apellido?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="g-3">
                    {/* DNI */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">DNI</Form.Label>
                            <Form.Control type="number" placeholder="Ej: 38122078" {...register("dni")} isInvalid={!!errors.dni} />
                            <Form.Control.Feedback type="invalid"> {errors.dni?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Correo */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Email</Form.Label>
                            <Form.Control type="text" placeholder="Ej: medico1@gmail.com" {...register("email")} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="g-3">
                    {/* Especialidad (Sin jsonPath) */}
                    <Col md={6}>
                        <SelectEditable 
                            label="Especialidad" 
                            name="especialidad" 
                            options={espValidas}
                            register={register} 
                            error={errors.especialidad?.message} 
                        />
                    </Col>
                    {/* Matrícula */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Matrícula</Form.Label>
                            <Form.Control type="text" placeholder="Ej: 12345" {...register("matricula")} onChange={handleMayus} isInvalid={!!errors.matricula} />
                            <Form.Control.Feedback type="invalid"> {errors.matricula?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting ? <Spinner size="sm" /> : "Registrar"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}