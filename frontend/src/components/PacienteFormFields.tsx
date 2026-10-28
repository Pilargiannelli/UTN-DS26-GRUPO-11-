import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { SelectEditable } from "./SelectEditable";
import { DateInput } from "./DateInput";
import { useMayus } from "../hooks/useMayus";
import { useEffect, useRef } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { pacienteSchema, type PacienteValidado } from "../schemas/pacienteSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetch } from "../hooks/useFetch";
import type { PacienteFormProps } from "../types/UserEditFormProps";
import { stringToDateInput } from "../hooks/useDateTransform";
import type { ObraSocial } from "../types/Paciente";

export function PacienteFormFields({ onSave, onCancel, paciente }: PacienteFormProps<PacienteValidado>) {
    const handleMayus = useMayus();
    const sexoOptions = ["Masculino", "Femenino", "Otro"];

    // Carga de obras sociales desde la API real
    const { data: obrasSocialesAPI, loading } = useFetch<ObraSocial[]>("/obras-sociales");
    const osValidas = obrasSocialesAPI 
        ? obrasSocialesAPI.map(os => typeof os === "string" ? os : os.nombre) 
        : ["Sin obra social"];

    // Schema sin dependencia de usuarios precargados en local
    const schema = pacienteSchema(osValidas, sexoOptions);

    const initialValues: PacienteValidado = {
        nombre: paciente.nombre,
        apellido: paciente.apellido,
        dni: String(paciente.dni ?? ""),
        email: paciente.email,
        telefono: paciente.telefono,
        obraSocial: paciente.obraSocial,
        nroAfiliado: paciente.nroAfiliado,
        plan: paciente.plan,
        sexo: paciente.sexo,
        fechaNacimiento: stringToDateInput(paciente.fechaNacimiento),
    };

    const { register, handleSubmit, setValue, control, formState: { errors } } = useForm<PacienteValidado>({
        resolver: zodResolver(schema) as Resolver<PacienteValidado>,
        mode: "onBlur",
        defaultValues: initialValues,
    });

    const obraSocialSeleccionada = useWatch({ control, name: "obraSocial" });
    const sinObraSocial = (obraSocialSeleccionada === "Sin obra social");
    const primeraCarga = useRef(true);

    useEffect(() => {
        if (primeraCarga.current) {
            primeraCarga.current = false;
            return;
        }
        if (sinObraSocial) {
            setValue("nroAfiliado", "-");
            setValue("plan", "-");
        } else {
            setValue("nroAfiliado", `${paciente.nroAfiliado}`);
            setValue("plan", `${paciente.plan}`);
        }
    }, [sinObraSocial, setValue, paciente.nroAfiliado, paciente.plan]);

    if (loading) return <Spinner animation="border" size="sm" />;

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
                <Row className="g-2 mb-2">
                    <Col md={12}>
                        <DateInput label="Fecha de nacimiento" register={register} errors={errors} fieldName="fechaNacimiento" />
                    </Col>
                </Row>
                <Row className="g-2">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label className="text-xs mb-1">Teléfono</Form.Label>
                            <Form.Control {...register("telefono")} isInvalid={!!errors.telefono} />
                            <Form.Control.Feedback type="invalid"> {errors.telefono?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <SelectEditable label="Sexo" name="sexo" options={sexoOptions} register={register} error={errors.sexo?.message} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-2 mt-1">
                    <Col md={4}>
                        <Form.Group>
                            <SelectEditable label="Obra social" name="obraSocial" options={osValidas} register={register} error={errors.obraSocial?.message} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="d-flex me-auto text-xs mb-1">Nro. afiliado</Form.Label>
                            <Form.Control type="text" placeholder="Ej: A-123456" {...register("nroAfiliado")} onChange={handleMayus} isInvalid={!!errors.nroAfiliado?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.nroAfiliado?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="d-flex me-auto text-xs mb-1">Plan</Form.Label>
                            <Form.Control type="text" placeholder="Ej: 210" {...register("plan")} onChange={handleMayus} isInvalid={!!errors.plan?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.plan?.message} </Form.Control.Feedback>
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