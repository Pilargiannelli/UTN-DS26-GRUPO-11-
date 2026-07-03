import { useForm } from "react-hook-form";
import { Form, Button } from 'react-bootstrap'
import { zodResolver } from "@hookform/resolvers/zod";
import '../assets/styles/Form.css'
import { useAuth } from "../hooks/useAuth";
import { newPasswordSchema, type NewPasswordValidada } from "../schemas/newPasswordSchema";
import { useCambioPassword } from "../hooks/useRegistroPassword";

export function NewPasswordForm(){
    const { cambiarPassword } = useCambioPassword();
    const { usuario } = useAuth();
    const { register, handleSubmit, formState: { errors } } = useForm<NewPasswordValidada>({
        resolver: zodResolver(newPasswordSchema(usuario?.p as string)),
        mode: "onBlur" 
    });
    const onSubmit = (data: NewPasswordValidada) => {
        try {
            cambiarPassword(data);
        } catch (error) { console.error("Error al procesar el registro:", error); }
    };
    return (
        <div className="container my-0 form-container">
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {/* Contraseña actual */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Contraseña actual</Form.Label>
                    <Form.Control type="password" {...register("currentPassword")} isInvalid={!!errors.currentPassword} />
                    <Form.Control.Feedback type="invalid"> {errors.currentPassword?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Contraseña nueva */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Nueva contraseña</Form.Label>
                    <Form.Control type="password" {...register("newPassword")} isInvalid={!!errors.newPassword} />
                    <Form.Control.Feedback type="invalid"> {errors.newPassword?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Repetir contraseña nueva */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Confirmar nueva contraseña</Form.Label>
                    <Form.Control type="password" {...register("repeatPassword")} isInvalid={!!errors.repeatPassword} />
                    <Form.Control.Feedback type="invalid"> {errors.repeatPassword?.message} </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary"> Confirmar datos </Button>
                </div>
            </Form>
        </div>
    );
}