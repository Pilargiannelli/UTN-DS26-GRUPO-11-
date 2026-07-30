import { useForm, type Resolver, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pacienteSchema, type PacienteValidado } from '../schemas/pacienteSchema.ts';
import { Button, Form, Row, Col, Spinner } from "react-bootstrap";
import { useFetch } from "../hooks/useFetch.ts";
import { SelectEditable } from "./SelectEditable.tsx";
import { DateInput } from "./DateInput.tsx";
import '../assets/styles/Form.css'
import { useEffect } from "react";
import { useMayus } from "../hooks/useMayus.ts";
import { useRegistroPasoUno } from "../hooks/useRegistro1.ts";
import type { Usuario } from "../types/Usuario.ts";
import { dateInputToString } from "../hooks/useDateTransform.ts";

export function RegistroPacienteForm() {
    const handleMayus = useMayus();
    const { procesarPasoUno } = useRegistroPasoUno();
    const sexo = ["Masculino", "Femenino", "Otro"];
    const { data: obrasSociales } = useFetch<string[]>("../../public/obras-sociales.json");
    const osValidas = obrasSociales || [""];
    const { data: usuariosDB, loading } = useFetch<Usuario[]>("../../public/users.json");
    const emailsOcupados = usuariosDB ? usuariosDB.map(u => u?.docs?.email?.trim().toLowerCase()).filter((email): email is string => !!email) : [];
    const schema = pacienteSchema(osValidas, sexo, emailsOcupados);
    const {register, handleSubmit, formState: { errors }, control, clearErrors, setValue} = useForm<PacienteValidado>({
        resolver: zodResolver(schema) as Resolver<PacienteValidado>,
        mode: "onBlur",
        defaultValues: { obraSocial: "", nroAfiliado: "", plan: "" }
    });
    const onSubmit = (data: PacienteValidado) => {
        const fechaString = dateInputToString(data.fechaNacimiento);
        const sexo = data.sexo as "Masculino"|"Femenino"|"Otro";
        const historial = { consultas: [], alergias: [], antecedentes: []};
        const dniString = String(data.dni);
        const pacienteFormateado = {...data, rol: "paciente", dni: dniString, fechaNacimiento: fechaString, sexo: sexo, historial: historial, nroAfiliado: data.nroAfiliado === "-" ? "" : data.nroAfiliado, plan: data.plan === "-" ? "" : data.plan,};
        procesarPasoUno(pacienteFormateado, "/registrar-usuario");
    };
    const obraSocialSeleccionada = useWatch({ control, name: "obraSocial" });
    const sinObraSocial = (obraSocialSeleccionada === "Sin obra social");
    useEffect(() => {
        if (sinObraSocial) {
            setValue("nroAfiliado", "-");
            setValue("plan", "-");
        } else {
            setValue("nroAfiliado", "");
            setValue("plan", "");
        }
    }, [sinObraSocial, clearErrors, setValue]);
    if (loading) return <Spinner/>;
    return (
        <div className="container my-0 form-container">
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {/* Datos personales */}
                <Form.Label className="mb-1">Datos personales</Form.Label>
                <Row className="g-3">
                    {/* Nombre */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Nombre</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Ana" {...register("nombre")} isInvalid={!!errors.nombre} />
                            <Form.Control.Feedback type="invalid"> {errors.nombre?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Apellido */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Apellido</Form.Label>
                            <Form.Control type="text" placeholder="Ej: Martínez" {...register("apellido")} isInvalid={!!errors.apellido} />
                            <Form.Control.Feedback type="invalid"> {errors.apellido?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-3">
                    {/* DNI */}
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">DNI</Form.Label>
                            <Form.Control type="number" placeholder="Ej: 38122078" {...register("dni")} isInvalid={!!errors.dni} />
                            <Form.Control.Feedback type="invalid"> {errors.dni?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Fecha de nacimiento */}
                    <Col md={4}>
                        <DateInput label="Fecha de nacimiento" register={register} errors={errors} fieldName="fechaNacimiento" />
                    </Col>
                    {/* Sexo */}
                    <Col>
                        <SelectEditable label="Sexo" name="sexo" jsonPath="/public/generos.json" register={register} error={errors.sexo?.message} />
                    </Col>
                </Row>
                {/* Contacto */}
                <Form.Label className="mt-2 mb-1">Datos de contacto</Form.Label>
                <Row className="g-3">
                    {/* Teléfono */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Teléfono</Form.Label>
                            <Form.Control type="number" placeholder="Ej: 5492215555555" {...register("telefono")} isInvalid={!!errors.telefono} />
                            <Form.Control.Feedback type="invalid"> {errors.telefono?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Correo */}
                    <Col md={6}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Email</Form.Label>
                            <Form.Control type="text" placeholder="Ej: paciente1@gmail.com" {...register("email")} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                {/* Cobertura médica */}
                <Form.Label className="mt-2 mb-1">Cobertura médica</Form.Label>
                <Row className="g-3">
                    {/* Obra Social */}
                    <Col md={4}>
                        <SelectEditable label="Obra social" name="obraSocial" jsonPath="/public/obras-sociales.json" register={register} error={errors.obraSocial?.message} />
                    </Col>
                    {/* Número de afiliado */}
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Número de afiliado</Form.Label>
                            <Form.Control type="text" placeholder="Ej: A-123456" {...register("nroAfiliado")} onChange={handleMayus} isInvalid={!!errors.nroAfiliado?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.nroAfiliado?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    {/* Plan */}
                    <Col md={4}>
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Plan</Form.Label>
                             <Form.Control type="text" placeholder="Ej: 210" {...register("plan")} onChange={handleMayus} isInvalid={!!errors.plan?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.plan?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary"> Confirmar datos </Button>
                </div>
            </Form>
        </div>
    );
}