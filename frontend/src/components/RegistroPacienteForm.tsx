import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { pacienteSchema, type PacienteValidado } from '../schemas/pacienteSchema.ts';
import { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useFetch } from "../hooks/useFetch.ts";
import { ToastMensaje } from "./NotifyToast.tsx";
import { SelectEditable } from "./SelectEditable.tsx";

interface RegistroPacienteFormProps {
  esAutoregistro: boolean;
}

export function RegistroPacienteForm({ esAutoregistro }: RegistroPacienteFormProps) {
    const [showToast, setShowToast] = useState(false);
    const { data: obrasSociales } = useFetch<string[]>("../../public/obras-sociales.json");
    const schema = obrasSociales ? pacienteSchema(obrasSociales) : pacienteSchema([""]);
    const {register, handleSubmit, formState: { errors }} = useForm<PacienteValidado>({
        resolver: zodResolver(schema) as Resolver<PacienteValidado>,
    });
    const onSubmit = (data: PacienteValidado) => {
        console.log("Datos validados:", data);
        setShowToast(true);
    };
    return (
        <div className="container my-0 form-container">
            <ToastMensaje mensaje={esAutoregistro ? "Cuenta creada correctamente" : "Paciente registrado correctamente"} tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
            <Form className="container my-5" onSubmit={handleSubmit(onSubmit)}>
                {/* Nombre */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Nombre</Form.Label>
                    <Form.Control type="text" {...register("nombre")} isInvalid={!!errors.nombre} />
                    <Form.Control.Feedback type="invalid"> {errors.nombre?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Apellido */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Apellido</Form.Label>
                    <Form.Control type="text" {...register("apellido")} isInvalid={!!errors.apellido} />
                    <Form.Control.Feedback type="invalid"> {errors.apellido?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* DNI */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">DNI</Form.Label>
                    <Form.Control type="number" {...register("dni")} isInvalid={!!errors.dni} />
                    <Form.Control.Feedback type="invalid"> {errors.dni?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Teléfono */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Teléfono</Form.Label>
                    <Form.Control type="number" placeholder="+5492215555555" {...register("telefono")} isInvalid={!!errors.telefono} />
                    <Form.Control.Feedback type="invalid"> {errors.telefono?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Obra Social */}
                <SelectEditable label="Obra social" name="obraSocial" jsonPath="../../public/obras-sociales.json" register={register} />
                {/* Campos condicionales para Autoregistro */}
                {esAutoregistro && (
                    <>
                        {/* Correo */}
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Email</Form.Label>
                            <Form.Control type="email" {...register("email")} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
                        </Form.Group>
                        {/* Contraseña */}
                        <Form.Group className="mb-3">
                            <Form.Label className="d-flex me-auto">Contraseña</Form.Label>
                            <Form.Control type="password" {...register("password")} isInvalid={!!errors.password} />
                            <Form.Control.Feedback> {errors.password?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </>
                )}
                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary"> Registrar </Button>
                </div>
            </Form>
        </div>
    );
}