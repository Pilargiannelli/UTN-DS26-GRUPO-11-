import { useForm, type Resolver, useWatch, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pacienteSchema, SIN_OBRA_SOCIAL, type PacienteValidado } from '../schemas/pacienteSchema.ts';
import { Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { useFetch } from "../hooks/useFetch.ts";
import { SelectEditable } from "./SelectEditable.tsx";
import { DateInput } from "./DateInput.tsx";
import '../assets/styles/Form.css';
import { useEffect, useState } from "react";
import { useMayus } from "../hooks/useMayus.ts";
import { dateInputToString } from "../hooks/useDateTransform.ts";
import { apiFetch, ApiError } from "../services/api.ts";
import type { ObraSocial } from "../types/Paciente.ts";
import { useNavigate } from "react-router-dom";

interface RegistroPacienteFormProps {
    // secretaria: POST /pacientes (usuario y contraseña inicial = DNI)
    // autoregistro: POST /auth/registro con la contraseña que elige el paciente
    modo: "secretaria" | "autoregistro";
}

// Campos del back (paciente.validation.ts) -> campos de este formulario
const CAMPO_FORM: Record<string, Path<PacienteValidado>> = {
    nombre: "nombre",
    apellido: "apellido",
    dni: "dni",
    email: "email",
    telefono: "telefono",
    sexo: "sexo",
    fechaNacimiento: "fechaNacimiento.year",
    "cobertura.nroAfiliado": "nroAfiliado",
    "cobertura.plan": "plan",
    password: "password",
};

export function RegistroPacienteForm({ modo }: RegistroPacienteFormProps) {
    const navigate = useNavigate();
    const handleMayus = useMayus();
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const esAutoregistro = modo === "autoregistro";

    const opcionesSexo = ["Masculino", "Femenino", "Otro"];

    // GET /api/obras-sociales devuelve [{ id, nombre }]: el select muestra el
    // nombre y al enviar se manda el id (cobertura.obraSocialId)
    const { data: obrasSocialesAPI, loading } = useFetch<ObraSocial[]>("/obras-sociales");
    const obrasSociales = obrasSocialesAPI ?? [];
    const osValidas = [SIN_OBRA_SOCIAL, ...obrasSociales.map((os) => os.nombre)];

    const schema = pacienteSchema(osValidas, opcionesSexo, esAutoregistro);

    const { register, handleSubmit, formState: { errors }, control, setValue, setError } = useForm<PacienteValidado>({
        resolver: zodResolver(schema) as Resolver<PacienteValidado>,
        mode: "onBlur",
        defaultValues: { obraSocial: "", nroAfiliado: "", plan: "" }
    });

    const onSubmit = async (data: PacienteValidado) => {
        setSubmitting(true);
        setErrorMsg(null);
        const obraSocial = obrasSociales.find((os) => os.nombre === data.obraSocial);
        const payload = {
            nombre: data.nombre,
            apellido: data.apellido,
            dni: data.dni,
            email: data.email,
            telefono: data.telefono,
            sexo: data.sexo,
            fechaNacimiento: dateInputToString(data.fechaNacimiento),
            ...(obraSocial && {
                cobertura: { obraSocialId: obraSocial.id, nroAfiliado: data.nroAfiliado, plan: data.plan },
            }),
            ...(esAutoregistro && { password: data.password }),
        };

        try {
            await apiFetch(esAutoregistro ? "/auth/registro" : "/pacientes", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            // El toast lo muestra la pantalla de destino (Login o BuscarPaciente)
            if (esAutoregistro) navigate("/", { state: { registroExitoso: true } });
            else navigate("/buscar-paciente", { state: { pacienteCreado: true } });
        } catch (err) {
            // 400 de Zod: marcamos cada campo. 409 (DNI repetido...): arriba del form
            const detalles = err instanceof ApiError ? err.detalles : [];
            detalles.forEach(({ campo, mensaje }) => {
                const campoForm = CAMPO_FORM[campo];
                if (campoForm) setError(campoForm, { message: mensaje });
            });
            setErrorMsg(err instanceof Error ? err.message : "Error al registrar el paciente");
        } finally {
            setSubmitting(false);
        }
    };

    const obraSocialSeleccionada = useWatch({ control, name: "obraSocial" });
    const sinObraSocial = (obraSocialSeleccionada === SIN_OBRA_SOCIAL);

    useEffect(() => {
        if (sinObraSocial) {
            setValue("nroAfiliado", "-");
            setValue("plan", "-");
        } else {
            setValue("nroAfiliado", "");
            setValue("plan", "");
        }
    }, [sinObraSocial, setValue]);

    if (loading) return <Spinner animation="border" />;

    return (
        <div className="container my-0 form-container">
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

                {/* Datos personales */}
                <Form.Label className="mb-1">Datos personales</Form.Label>
                <Row className="g-3">
                    {/* Nombre */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-nombre">
                            <Form.Label className="d-flex me-auto">Nombre</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Ana" {...register("nombre")} isInvalid={!!errors.nombre} />
                            <Form.Control.Feedback type="invalid"> {errors.nombre?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Apellido */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-apellido">
                            <Form.Label className="d-flex me-auto">Apellido</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Martínez" {...register("apellido")} isInvalid={!!errors.apellido} />
                            <Form.Control.Feedback type="invalid"> {errors.apellido?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-3">
                    {/* DNI */}
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="reg-dni">
                            <Form.Label className="d-flex me-auto">DNI</Form.Label>
                            <Form.Control type="text" inputMode="numeric" placeholder="Ej: 38122078" {...register("dni")} isInvalid={!!errors.dni} />
                            <Form.Control.Feedback type="invalid"> {errors.dni?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Fecha de nacimiento */}
                    <Col md={4}>
                        <DateInput label="Fecha de nacimiento" register={register} errors={errors} fieldName="fechaNacimiento" />
                    </Col>
                    {/* Sexo */}
                    <Col md={4}>
                        <SelectEditable label="Sexo" name="sexo" options={opcionesSexo} register={register} error={errors.sexo?.message} />
                    </Col>
                </Row>

                {/* Contacto */}
                <Form.Label className="mt-2 mb-1">Datos de contacto</Form.Label>
                <Row className="g-3">
                    {/* Teléfono */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-telefono">
                            <Form.Label className="d-flex me-auto">Teléfono</Form.Label>
                            <Form.Control type="tel" inputMode="numeric" placeholder="Ej: 5492344555555" {...register("telefono")} isInvalid={!!errors.telefono} />
                            <Form.Control.Feedback type="invalid"> {errors.telefono?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Correo */}
                    <Col md={6}>
                        <Form.Group className="mb-3" controlId="reg-email">
                            <Form.Label className="d-flex me-auto">Email</Form.Label>
                            <Form.Control type="email" placeholder="Ej: paciente1@gmail.com" {...register("email")} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                {/* Cobertura médica */}
                <Form.Label className="mt-2 mb-1">Cobertura médica</Form.Label>
                <Row className="g-3">
                    {/* Obra Social */}
                    <Col md={4}>
                        <SelectEditable label="Obra social" name="obraSocial" options={osValidas} register={register} error={errors.obraSocial?.message} />
                    </Col>
                    {/* Número de afiliado */}
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="reg-afiliado">
                            <Form.Label className="d-flex me-auto">Número de afiliado</Form.Label>
                            <Form.Control type="text" placeholder="Ej: A-123456" {...register("nroAfiliado")} onChange={handleMayus} isInvalid={!!errors.nroAfiliado?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.nroAfiliado?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Plan */}
                    <Col md={4}>
                        <Form.Group className="mb-3" controlId="reg-plan">
                            <Form.Label className="d-flex me-auto">Plan</Form.Label>
                            <Form.Control type="text" placeholder="Ej: 210" {...register("plan")} onChange={handleMayus} isInvalid={!!errors.plan?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.plan?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>

                {esAutoregistro ? (
                    <>
                        {/* Acceso */}
                        <Form.Label className="mt-2 mb-1">Contraseña para ingresar</Form.Label>
                        <Row className="g-3">
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="reg-password">
                                    <Form.Label className="d-flex me-auto">Contraseña</Form.Label>
                                    <Form.Control type="password" autoComplete="new-password" {...register("password")} isInvalid={!!errors.password} />
                                    <Form.Text>Al menos 8 caracteres, con mayúscula, minúscula y número.</Form.Text>
                                    <Form.Control.Feedback type="invalid"> {errors.password?.message} </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3" controlId="reg-repetir">
                                    <Form.Label className="d-flex me-auto">Repetir contraseña</Form.Label>
                                    <Form.Control type="password" autoComplete="new-password" {...register("repetirPassword")} isInvalid={!!errors.repetirPassword} />
                                    <Form.Control.Feedback type="invalid"> {errors.repetirPassword?.message} </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>
                    </>
                ) : (
                    <p className="text-muted small">
                        El paciente va a poder ingresar con su email y su DNI como contraseña inicial.
                    </p>
                )}

                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting ? <Spinner size="sm" /> : esAutoregistro ? "Crear cuenta" : "Registrar paciente"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
