import { Button, Col, Form, Row } from "react-bootstrap";
import { SelectEditable } from "./SelectEditable";
import { useMayus } from "../hooks/useMayus";
import { useFetch } from "../hooks/useFetch";
import type { Usuario } from "../types/Usuario";
import { medicoSchema, type MedicoValidado } from "../schemas/medicoSchema";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MedicoFormProps } from "../types/UserEditFormProps";

export function MedicoFormFields({onSave, onCancel}: MedicoFormProps<MedicoValidado>) {
    const handleMayus = useMayus();
    const { data: especialidades } = useFetch<string[]>("/public/especialidades.json");
    const espValidas = especialidades || [""];
    const { data: usuariosDB } = useFetch<Usuario[]>("/public/users.json");
    const emailsOcupados = usuariosDB ? usuariosDB.map(u => u?.docs?.email?.trim().toLowerCase()).filter((email): email is string => !!email) : [];
    const schema = medicoSchema(espValidas, emailsOcupados);
    const { register, handleSubmit, formState: {errors} } = useForm<MedicoValidado>({
        resolver: zodResolver(schema) as Resolver<MedicoValidado>,
        mode: "onBlur",
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
                <Row className="g-2">
                    <Col md={6}>
                        <Form.Group>
                            <SelectEditable label="Especialidad" name="especialidad" jsonPath="../../public/especialidades.json" register={register} error={errors.especialidad?.message} />
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                       <Form.Group>
                            <Form.Label className="d-flex me-auto">Matrícula</Form.Label>
                            <Form.Control type="text" placeholder="Ej: 12345" {...register("matricula")} onChange={ handleMayus } isInvalid={!!errors.matricula} />
                            <Form.Control.Feedback type="invalid"> {errors.matricula?.message} </Form.Control.Feedback>
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