import { singinSchema, type SinginData } from "../schemas/newUserSchema";
import { useForm, type Resolver } from "react-hook-form";
import { Form, Button, Spinner } from 'react-bootstrap';
import { zodResolver } from "@hookform/resolvers/zod";
import '../assets/styles/Form.css';
import { useState } from "react";
import { apiFetch } from "../services/api";

export function UserForm() {
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    // Schema sin dependencia de usuarios precargados
    const schema = singinSchema([]);

    const { register, handleSubmit, formState: { errors } } = useForm<SinginData>({
        resolver: zodResolver(schema) as Resolver<SinginData>,
        mode: "onBlur"
    });

    const onSubmit = async (data: SinginData) => {
        setSubmitting(true);
        setErrorMsg(null);
        try {
            const payload = {
                username: data.username,
                password: data.password,
                rol: "PACIENTE"
            };

            await apiFetch("/usuarios", {
                method: "POST",
                body: JSON.stringify(payload)
            });

            window.location.href = "/login";
        } catch (err: any) {
            setErrorMsg(err.message || "Error al registrar el usuario");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container my-0 form-container">
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

                {/* Nombre de Usuario */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Nombre de usuario</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Ej: usuario123" 
                        {...register("username")} 
                        isInvalid={!!errors.username} 
                    />
                    <Form.Control.Feedback type="invalid"> 
                        {errors.username?.message} 
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Contraseña */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Contraseña</Form.Label>
                    <Form.Control 
                        type="password" 
                        {...register("password")} 
                        isInvalid={!!errors.password} 
                    />
                    <Form.Control.Feedback type="invalid"> 
                        {errors.password?.message} 
                    </Form.Control.Feedback>
                </Form.Group>

                {/* Repetir contraseña */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Confirmar contraseña</Form.Label>
                    <Form.Control 
                        type="password" 
                        {...register("password2")} 
                        isInvalid={!!errors.password2} 
                    />
                    <Form.Control.Feedback type="invalid"> 
                        {errors.password2?.message} 
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary" disabled={submitting}>
                        {submitting ? <Spinner size="sm" /> : "Confirmar datos"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}