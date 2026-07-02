import { Form, Row, Col, Button } from "react-bootstrap";
import { SelectEditable } from "./SelectEditable";
import { DateInput } from "./DateInput";
import { useMayus } from "../hooks/useMayus";
import { useEffect } from "react";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { pacienteSchema, type PacienteValidado } from "../schemas/pacienteSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetch } from "../hooks/useFetch";
import type { Usuario } from "../types/Usuario";
import { CommonFormFields } from "./CommonFormFields";
import type { PacienteFormProps } from "../types/UserEditFormProps";

export function PacienteFormFields({onSave, onCancel}: PacienteFormProps<PacienteValidado>) {
    const handleMayus = useMayus();
    const sexo = ["Masculino", "Femenino", "Otro"];
    const { data: obrasSociales } = useFetch<string[]>("../../public/obras-sociales.json");
    const osValidas = obrasSociales || [""];
    const { data: usuariosDB } = useFetch<Usuario[]>("../../public/users.json");
    const emailsOcupados = usuariosDB ? usuariosDB.map(u => u?.docs?.email?.trim().toLowerCase()).filter((email): email is string => !!email) : [];
    const schema = pacienteSchema(osValidas, sexo, emailsOcupados);
    const { register, clearErrors, setValue, control, formState: {errors} } = useForm<PacienteValidado>({
        resolver: zodResolver(schema) as Resolver<PacienteValidado>,
        mode: "onBlur",
        defaultValues: { obraSocial: "", nroAfiliado: "", plan: "" }
    });
    const obraSocialSeleccionada = useWatch({ control, name: "obraSocial" });
    const sinObraSocial = (obraSocialSeleccionada === "Sin obra social");
    useEffect(() => {
        if (sinObraSocial) {
            setValue("nroAfiliado", "-");
            setValue("plan", "-");
        } else {
            setValue("nroAfiliado", "");
            setValue("plan", "");
        }
    }, [sinObraSocial, clearErrors, setValue]);
    return (
        <div className="form-container animate-fadeIn text-start p-2">
            <Form noValidate onSubmit={onSave}>
                <CommonFormFields register={register} errors={errors} />
                <Row className="g-2">
                    <Col md={12}>
                        <DateInput label="Fecha de nacimiento" register={register} errors={errors} fieldName="fechaNacimiento" />
                    </Col>
                </Row>
                <Row className="g-2">
                    <Col md={6}>
                        <Form.Group>
                            <Form.Label>Teléfono</Form.Label>
                            <Form.Control {...register("telefono")} isInvalid={!!errors.telefono} />
                            <Form.Control.Feedback type="invalid"> {errors.telefono?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group>
                            <SelectEditable label="Sexo" name="sexo" jsonPath="/public/generos.json" register={register} error={errors.sexo?.message} />
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-2">
                    <Col md={4}>
                        <Form.Group>
                            <SelectEditable label="Obra social" name="obraSocial" jsonPath="/public/obras-sociales.json" register={register} error={errors.obraSocial?.message} />
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="d-flex me-auto">Nro. afiliado</Form.Label>
                            <Form.Control type="text" placeholder="Ej: A-123456" {...register("nroAfiliado")} onChange={handleMayus} isInvalid={!!errors.nroAfiliado?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.nroAfiliado?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group>
                            <Form.Label className="d-flex me-auto">Plan</Form.Label>
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