import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SelectEditable } from "./SelectEditable.tsx";
import { medicoSchema, type MedicoValidado } from "../schemas/medicoSchema.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { useMayus } from "../hooks/useMayus.ts";
import { useRegistroPasoUno } from "../hooks/useRegistro1.ts";
import type { Usuario } from "../types/Usuario.ts";

export function RegistroMedicoForm() {
    const handleMayus = useMayus();
    const { procesarPasoUno } = useRegistroPasoUno();
    const { data: especialidades } = useFetch<string[]>("../../public/especialidades.json");
    const espValidas = especialidades || [""];
    const { data: usuariosDB, loading } = useFetch<Usuario[]>("../../public/users.json");
    const emailsOcupados = usuariosDB ? usuariosDB.map(u => u?.docs?.email?.trim().toLowerCase()).filter((email): email is string => !!email) : [];
    const schema = medicoSchema(espValidas, emailsOcupados);
    const {register, handleSubmit, formState: { errors }} = useForm<MedicoValidado>({
        resolver: zodResolver(schema) as Resolver<MedicoValidado>,
        mode: "onBlur",
    });
    const onSubmit = (data: MedicoValidado) => {
        const matriculaString = String(data.matricula);
        const dniString = String(data.dni);
        const medicoFormateado = {...data, rol: "medico", dni: dniString , matricula: matriculaString};
        procesarPasoUno(medicoFormateado, "/registrar-usuario");
    };
    if (loading) return <Spinner/>;
  return (
    <div className="container my-0 form-container">
        <Form className="container my-5" onSubmit={handleSubmit(onSubmit)}>
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
                        <Form.Control type="text" placeholder="Ej: Henández" {...register("apellido")} isInvalid={!!errors.apellido} />
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
                {/* Especialidad */}
                <Col md={6}>
                    <SelectEditable label="Especialidad" name="especialidad" jsonPath="../../public/especialidades.json" register={register} error={errors.especialidad?.message} />
                </Col>
                {/* Matrícula */}
                <Col md={6}>
                    <Form.Group className="mb-3">
                        <Form.Label className="d-flex me-auto">Matrícula</Form.Label>
                        <Form.Control type="text" placeholder="Ej: 12345" {...register("matricula")} onChange={ handleMayus } isInvalid={!!errors.matricula} />
                        <Form.Control.Feedback type="invalid"> {errors.matricula?.message} </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary">Registrar</Button>
            </div>
        </Form>
    </div>
    );
}