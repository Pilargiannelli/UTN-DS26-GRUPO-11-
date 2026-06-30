import { useState } from "react";
import { ToastMensaje } from "./NotifyToast";
import { singinSchema, type SinginData } from "../schemas/newUserSchema";
import { useForm, type Resolver } from "react-hook-form";
import { Form, Button } from 'react-bootstrap'
import { zodResolver } from "@hookform/resolvers/zod";
import '../assets/styles/Form.css'

export function UserForm(){
    const [showToast, setShowToast] = useState(false);
    const schema = singinSchema;
    const {register, handleSubmit, formState: { errors }} = useForm<SinginData>({
        resolver: zodResolver(schema) as Resolver<SinginData>,
    });
    const onSubmit = (data: SinginData) => {
        console.log("Datos validados:", data);
        setShowToast(true);
    };
    return (
        <div className="container my-0 form-container">
            <ToastMensaje mensaje="Cuenta creada correctamente" tipo="toast-good" mostrar={showToast} onClose={() => setShowToast(false)} />
            <Form className="container my-5 w-75" noValidate onSubmit={handleSubmit(onSubmit)}>
                {/* Usuario */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Nombre de usuario</Form.Label>
                    <Form.Control type="text" placeholder="Ej: usuario123" {...register("username")} isInvalid={!!errors.username} />
                    <Form.Control.Feedback type="invalid"> {errors.username?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Contraseña */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Contraseña</Form.Label>
                    <Form.Control type="password" {...register("password")} isInvalid={!!errors.password} />
                    <Form.Control.Feedback type="invalid"> {errors.password?.message} </Form.Control.Feedback>
                </Form.Group>
                {/* Repetir contraseña */}
                <Form.Group className="mb-3">
                    <Form.Label className="d-flex me-auto">Confirmar contraseña</Form.Label>
                    <Form.Control type="password" {...register("password2")} isInvalid={!!errors.password2} />
                    <Form.Control.Feedback type="invalid"> {errors.password2?.message} </Form.Control.Feedback>
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button type="submit" variant="primary"> Confirmar datos </Button>
                </div>
            </Form>
        </div>
    );
}