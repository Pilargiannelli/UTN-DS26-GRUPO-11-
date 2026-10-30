import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Spinner, Row, Col } from 'react-bootstrap'
import { zodResolver } from "@hookform/resolvers/zod";
import { newPasswordSchema, type NewPasswordValidada } from "../schemas/newPasswordSchema";
import { apiFetch } from "../services/api";

interface NewPasswordFormProps {
    onListo: () => void;
}

// Cambio de contraseña en la pestaña Seguridad de "Mi cuenta", directo, sin
// ir a otra página. PATCH /api/auth/password: el back verifica la actual (400 si no
// coincide) y guarda la nueva hasheada.
export function NewPasswordForm({ onListo }: NewPasswordFormProps) {
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } = useForm<NewPasswordValidada>({
        resolver: zodResolver(newPasswordSchema),
        mode: "onBlur"
    });

    const onSubmit = async (data: NewPasswordValidada) => {
        setErrorMsg(null);
        try {
            await apiFetch("/auth/password", {
                method: "PATCH",
                body: JSON.stringify({ passwordActual: data.currentPassword, passwordNueva: data.newPassword }),
            });
            reset();
            onListo();
        } catch (error) {
            // Por ejemplo "La contraseña actual es incorrecta" (400 del back)
            setErrorMsg(error instanceof Error ? error.message : "No se pudo cambiar la contraseña");
        }
    };

    return (
        <Form noValidate onSubmit={handleSubmit(onSubmit)}>
            {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}
            <Form.Group className="mb-3" controlId="pass-actual">
                <Form.Label>Contraseña actual</Form.Label>
                <Form.Control type="password" autoComplete="current-password" {...register("currentPassword")} isInvalid={!!errors.currentPassword} />
                <Form.Control.Feedback type="invalid">{errors.currentPassword?.message}</Form.Control.Feedback>
            </Form.Group>
            <Row className="g-3">
                <Col md={6}>
                    <Form.Group controlId="pass-nueva">
                        <Form.Label>Nueva contraseña</Form.Label>
                        <Form.Control type="password" autoComplete="new-password" {...register("newPassword")} isInvalid={!!errors.newPassword} />
                        <Form.Control.Feedback type="invalid">{errors.newPassword?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="pass-repetir">
                        <Form.Label>Repetir nueva contraseña</Form.Label>
                        <Form.Control type="password" autoComplete="new-password" {...register("repeatPassword")} isInvalid={!!errors.repeatPassword} />
                        <Form.Control.Feedback type="invalid">{errors.repeatPassword?.message}</Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <p className="perfil-nota">Al menos 8 caracteres, con mayúscula, minúscula y número.</p>
            <div className="perfil-form-acciones">
                {isDirty && (
                    <Button variant="outline-secondary" onClick={() => reset()} disabled={isSubmitting}>Descartar</Button>
                )}
                <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
                    {isSubmitting ? <Spinner size="sm" animation="border" /> : "Cambiar contraseña"}
                </Button>
            </div>
        </Form>
    );
}
