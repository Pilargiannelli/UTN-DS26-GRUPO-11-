import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ToastMensaje } from "./NotifyToast.tsx";
import { SelectEditable } from "./SelectEditable.tsx";
import { medicoSchema, type MedicoValidado } from "../schemas/medicoSchema.ts";
import { useFetch } from "../hooks/useFetch.ts";
import { useMayus } from "../hooks/useMayus.ts";

export function RegistroMedicoForm() {
    const [showToast, setShowToast] = useState(false);
    const handleMayus = useMayus();
    const { data: especialidades } = useFetch<string[]>("../../public/especialidades.json");
    const schema = especialidades ? medicoSchema(especialidades) : medicoSchema([""]);
    const {register, handleSubmit, formState: { errors }} = useForm<MedicoValidado>({
        resolver: zodResolver(schema) as Resolver<MedicoValidado>,
    });
    const onSubmit = (data: MedicoValidado) => {
        console.log("Datos validados:", data);
        setShowToast(true);
    };
  return (
    <div className="container my-0 form-container">
        <ToastMensaje mensaje="Médico registrado correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
        <Form className="container my-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Nombre */}
            <Form.Group className="mb-3">
                <Form.Label className="d-flex me-auto">Nombre</Form.Label>
                <Form.Control {...register("nombre")} isInvalid={!!errors.nombre} />
                <Form.Control.Feedback type="invalid"> {errors.nombre?.message} </Form.Control.Feedback>
            </Form.Group>
            {/* Apellido */}
            <Form.Group className="mb-3">
                <Form.Label className="d-flex me-auto">Apellido</Form.Label>
                <Form.Control {...register("apellido")} isInvalid={!!errors.apellido} />
                <Form.Control.Feedback type="invalid"> {errors.apellido?.message} </Form.Control.Feedback>
            </Form.Group>
            {/* DNI */}
            <Form.Group className="mb-3">
                <Form.Label className="d-flex me-auto">DNI</Form.Label>
                <Form.Control type="number" {...register("dni")} isInvalid={!!errors.dni} />
                <Form.Control.Feedback type="invalid"> {errors.dni?.message} </Form.Control.Feedback>
            </Form.Group>
            {/* Correo */}
            <Form.Group className="mb-3">
                <Form.Label className="d-flex me-auto">Email</Form.Label>
                <Form.Control type="email" {...register("email")} isInvalid={!!errors.email} />
                <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
            </Form.Group>
            {/* Especialidad */}
            <SelectEditable label="Especialidad" name="especialidad" jsonPath="../../public/especialidades.json" register={register} />
            {/* Matrícula */}
            <Form.Group className="mb-3">
                <Form.Label className="d-flex me-auto">Matrícula</Form.Label>
                <Form.Control {...register("matricula")} onChange={ handleMayus } isInvalid={!!errors.matricula} />
                <Form.Control.Feedback type="invalid"> {errors.matricula?.message} </Form.Control.Feedback>
            </Form.Group>
            <div className="d-flex justify-content-end">
                <Button type="submit" variant="primary">Registrar</Button>
            </div>
        </Form>
    </div>
    );
}