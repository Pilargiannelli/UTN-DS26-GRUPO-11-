import { useForm, type Resolver } from "react-hook-form";
import { adminSchema, type AdminValidado } from "../schemas/adminSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, Button, Col, Row } from "react-bootstrap";
import type { AdminEditFormProps } from "../types/UserEditFormProps";

export function AdminFormFields({ onSave, onCancel, admin }: AdminEditFormProps<AdminValidado>) {
    // Schema sin dependencia de usuarios precargados en local
    const schema = adminSchema([]);

    const initialValues: AdminValidado = {
        nombre: admin.nombre,
        apellido: admin.apellido,
        dni: typeof admin.dni === "number" ? admin.dni : parseInt(admin.dni) || 0,
        email: admin.email,
    };

    const { register, handleSubmit, formState: { errors } } = useForm<AdminValidado>({
        resolver: zodResolver(schema) as Resolver<AdminValidado>,
        mode: "onBlur",
        defaultValues: initialValues,
    });

    return (
        <div className="form-container animate-fadeIn text-start p-2">
            <Form noValidate onSubmit={handleSubmit(onSave)}>
                <Row className="g-2 mb-2">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="text-xs mb-1">Nombre</Form.Label>
                            <Form.Control type="text" {...register("nombre")} isInvalid={!!errors.nombre} />
                            <Form.Control.Feedback type="invalid"> {errors.nombre?.message as string} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="text-xs mb-1">Apellido</Form.Label>
                            <Form.Control type="text" {...register("apellido")} isInvalid={!!errors.apellido} />
                            <Form.Control.Feedback type="invalid"> {errors.apellido?.message as string} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-2 mb-3">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="text-xs mb-1">DNI</Form.Label>
                            <Form.Control type="number" {...register("dni")} isInvalid={!!errors.dni} />
                            <Form.Control.Feedback type="invalid"> {errors.dni?.message as string} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="text-xs mb-1">Email</Form.Label>
                            <Form.Control type="email" {...register("email")} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid"> {errors.email?.message as string} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <div className="d-flex justify-content-end gap-2 mt-4 pt-2 border-t">
                    <Button type="button" variant="secondary" size="sm" onClick={onCancel}> Cancelar </Button>
                    <Button type="submit" variant="primary" size="sm"> Confirmar datos </Button>
                </div>
            </Form>
        </div>
    );
}