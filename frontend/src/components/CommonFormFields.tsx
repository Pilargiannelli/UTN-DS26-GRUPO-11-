import { Form, Row, Col } from "react-bootstrap";
import type { FieldErrors, FieldValues, Path, UseFormRegister } from "react-hook-form";

type CommonFormFieldsProps<T extends FieldValues> = {
    register: UseFormRegister<T>;
    errors: FieldErrors<T>;
};

export function CommonFormFields<T extends FieldValues>({ register, errors, }: CommonFormFieldsProps<T>) {
    return (
        <>
            <Row className="g-2 mb-2">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="text-xs mb-1">Nombre</Form.Label>
                        <Form.Control type="text" {...register("nombre" as Path<T>)} isInvalid={!!errors.nombre} />
                        <Form.Control.Feedback type="invalid"> {errors.nombre?.message as string} </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="text-xs mb-1">Apellido</Form.Label>
                        <Form.Control type="text" {...register("apellido" as Path<T>)} isInvalid={!!errors.apellido} />
                        <Form.Control.Feedback type="invalid"> {errors.apellido?.message as string} </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
            <Row className="g-2 mb-3">
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="text-xs mb-1">DNI</Form.Label>
                        <Form.Control type="text" {...register("dni" as Path<T>)} isInvalid={!!errors.dni} />
                        <Form.Control.Feedback type="invalid"> {errors.dni?.message as string} </Form.Control.Feedback>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group>
                        <Form.Label className="text-xs mb-1">Email</Form.Label>
                        <Form.Control type="email" {...register("email" as Path<T>)} isInvalid={!!errors.email} />
                        <Form.Control.Feedback type="invalid"> {errors.email?.message as string} </Form.Control.Feedback>
                    </Form.Group>
                </Col>
            </Row>
        </>
    );
}