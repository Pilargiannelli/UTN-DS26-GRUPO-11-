import { useState } from "react";
import { useForm } from "react-hook-form";
import { Form, Button, Spinner } from 'react-bootstrap'
import { zodResolver } from "@hookform/resolvers/zod";
import '../assets/styles/Form.css'
import { newPasswordSchema, type NewPasswordValidada } from "../schemas/newPasswordSchema";
import { useCambioPassword } from "../hooks/useRegistroPassword";

export function NewPasswordForm(){
    const { cambiarPassword } = useCambioPassword();
    const [enviando, setEnviando] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { register, handleSubmit, formState: { errors } } = useForm<NewPasswordValidada>({
        resolver: zodResolver(newPasswordSchema),
        mode: "onBlur"
    });
    const onSubmit = async (data: NewPasswordValidada) => {
        setEnviando(true);
        setErrorMsg(null);
        try {
            await cambiarPassword(data);
        } catch (error) {
            // Por ejemplo "La contraseña actual es incorrecta" (400 del back)
            setErrorMsg(error instanceof Error ? error.message : "No se pudo cambiar la contraseña");
            setEnviando(false);
        }
    };
    return (
        <div className="container my-0 form-container">
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}
                {/* Contraseña actual */}
                <Form.Group className="mb-3" controlId="pass-actual">
                    <Form.Label className="d-flex me-auto">Contraseña actual</Form.Label>
                    <Form.Control type="password" autoComplete="current-password" {...register("currentPassword")} isInvalid={!!errors.currentPassword} />
                    <Form.Control.Feedback type="invalid"> {errors.currentPassword?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Contraseña nueva */}
                <Form.Group className="mb-3" controlId="pass-nueva">
                    <Form.Label className="d-flex me-auto">Nueva contraseña</Form.Label>
                    <Form.Control type="password" autoComplete="new-password" {...register("newPassword")} isInvalid={!!errors.newPassword} />
                    <Form.Text>Al menos 8 caracteres, con mayúscula, minúscula y número.</Form.Text>
                    <Form.Control.Feedback type="invalid"> {errors.newPassword?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Repetir contraseña nueva */}
                <Form.Group className="mb-3" controlId="pass-repetir">
                    <Form.Label className="d-flex me-auto">Confirmar nueva contraseña</Form.Label>
                    <Form.Control type="password" autoComplete="new-password" {...register("repeatPassword")} isInvalid={!!errors.repeatPassword} />
                    <Form.Control.Feedback type="invalid"> {errors.repeatPassword?.message} </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary" disabled={enviando}>
                        {enviando ? <Spinner size="sm" animation="border" /> : "Cambiar contraseña"}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
