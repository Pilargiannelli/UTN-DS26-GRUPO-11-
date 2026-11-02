import { Form, Row, Col, Button, Spinner } from "react-bootstrap";
import { SelectEditable } from "./SelectEditable";
import { DateInput } from "./DateInput";
import { useMayus } from "../hooks/useMayus";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch, type Path, type Resolver } from "react-hook-form";
import { pacienteSchema, SIN_OBRA_SOCIAL, type PacienteValidado } from "../schemas/pacienteSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFetch } from "../hooks/useFetch";
import type { PacienteFormProps } from "../types/UserEditFormProps";
import type { CoberturaPaciente, PacientePerfil } from "../types/Usuario";
import { stringToDateInput, dateInputToString } from "../hooks/useDateTransform";
import type { ObraSocial } from "../types/Paciente";
import { apiFetch, ApiError } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import { AgregarObraSocial } from "./AgregarObraSocial";
import { Check2 } from "react-bootstrap-icons";

// Respuesta de PUT /api/pacientes/:id (paciente.service.ts)
interface PacienteActualizado extends PacientePerfil {
    usuario: { id: number; username: string; nombre: string; apellido: string; email: string; dni: string };
    coberturas: CoberturaPaciente[];
}

// Campos del back (paciente.validation.ts) -> campos de este formulario
const CAMPO_FORM: Record<string, Path<PacienteValidado>> = {
    nombre: "nombre",
    apellido: "apellido",
    dni: "dni",
    email: "email",
    telefono: "telefono",
    sexo: "sexo",
    fechaNacimiento: "fechaNacimiento.year",
    "cobertura.nroAfiliado": "nroAfiliado",
    "cobertura.plan": "plan",
};

export function PacienteFormFields({ onSave, onCancel, usuario }: PacienteFormProps) {
    const handleMayus = useMayus();
    const sexoOptions = ["Masculino", "Femenino", "Otro"];
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const paciente = usuario.paciente!;
    const cobertura = paciente.coberturas?.[0];

    const { tieneRol } = useAuth();
    const { data: obrasSocialesAPI, loading } = useFetch<ObraSocial[]>("/obras-sociales");
    const [obrasAgregadas, setObrasAgregadas] = useState<ObraSocial[]>([]);
    const obrasSociales = [...(obrasSocialesAPI ?? []), ...obrasAgregadas];
    const osValidas = [SIN_OBRA_SOCIAL, ...obrasSociales.map((os) => os.nombre)];

    const schema = pacienteSchema(sexoOptions);

    const initialValues: PacienteValidado = {
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        dni: usuario.dni,
        email: usuario.email,
        telefono: paciente.telefono,
        obraSocial: cobertura?.obraSocial.nombre ?? SIN_OBRA_SOCIAL,
        nroAfiliado: cobertura?.nroAfiliado ?? "-",
        plan: cobertura?.plan ?? "-",
        sexo: paciente.sexo,
        fechaNacimiento: stringToDateInput(paciente.fechaNacimiento.split("T")[0]),
    };

    const { register, handleSubmit, setValue, setError, control, formState: { errors, isSubmitting, isDirty } } = useForm<PacienteValidado>({
        resolver: zodResolver(schema) as Resolver<PacienteValidado>,
        mode: "onBlur",
        defaultValues: initialValues,
    });

    const obraSocialSeleccionada = useWatch({ control, name: "obraSocial" });
    const sinObraSocial = (obraSocialSeleccionada === SIN_OBRA_SOCIAL);
    const primeraCarga = useRef(true);

    useEffect(() => {
        if (primeraCarga.current) {
            primeraCarga.current = false;
            return;
        }
        setValue("nroAfiliado", sinObraSocial ? "-" : cobertura?.nroAfiliado ?? "");
        setValue("plan", sinObraSocial ? "-" : cobertura?.plan ?? "");
    }, [sinObraSocial, setValue, cobertura?.nroAfiliado, cobertura?.plan]);

    const guardar = async (data: PacienteValidado) => {
        setErrorMsg(null);
        const obraSocial = obrasSociales.find((os) => os.nombre === data.obraSocial);
        try {
            const actualizado = await apiFetch<PacienteActualizado>(`/pacientes/${paciente.id}`, {
                method: "PUT",
                body: JSON.stringify({
                    nombre: data.nombre,
                    apellido: data.apellido,
                    dni: data.dni,
                    email: data.email,
                    telefono: data.telefono,
                    sexo: data.sexo,
                    fechaNacimiento: dateInputToString(data.fechaNacimiento),
                    ...(obraSocial && {
                        cobertura: { obraSocialId: obraSocial.id, nroAfiliado: data.nroAfiliado, plan: data.plan },
                    }),
                }),
            });
            const { usuario: datosUsuario, ...ficha } = actualizado;
            onSave({ ...usuario, ...datosUsuario, paciente: ficha });
        } catch (err) {
            const detalles = err instanceof ApiError ? err.detalles : [];
            detalles.forEach(({ campo, mensaje }) => {
                const campoForm = CAMPO_FORM[campo];
                if (campoForm) setError(campoForm, { message: mensaje });
            });
            setErrorMsg(err instanceof Error ? err.message : "No se pudieron guardar los cambios");
        }
    };

    if (loading) return <Spinner animation="border" size="sm" />;

    return (
        <div className="form-container animate-fadeIn text-start p-2">
            <Form noValidate onSubmit={handleSubmit(guardar)}>
                {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}
                <Row className="g-2 mb-2">
                    <Col md={6}>
                        <Form.Group controlId="edit-nombre">
                            <Form.Label className="text-xs mb-1">Nombre</Form.Label>
                            <Form.Control type="text" {...register("nombre")} isInvalid={!!errors.nombre} />
                            <Form.Control.Feedback type="invalid"> {errors.nombre?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="edit-apellido">
                            <Form.Label className="text-xs mb-1">Apellido</Form.Label>
                            <Form.Control type="text" {...register("apellido")} isInvalid={!!errors.apellido} />
                            <Form.Control.Feedback type="invalid"> {errors.apellido?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="g-2 mb-3">
                    <Col md={6}>
                        <Form.Group controlId="edit-dni">
                            <Form.Label className="text-xs mb-1">DNI</Form.Label>
                            <Form.Control type="text" inputMode="numeric" {...register("dni")} isInvalid={!!errors.dni} />
                            <Form.Control.Feedback type="invalid"> {errors.dni?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <Form.Group controlId="edit-email">
                            <Form.Label className="text-xs mb-1">Email</Form.Label>
                            <Form.Control type="email" {...register("email")} isInvalid={!!errors.email} />
                            <Form.Control.Feedback type="invalid"> {errors.email?.message} </Form.Control.Feedback>
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
                        <Form.Group controlId="edit-telefono">
                            <Form.Label className="text-xs mb-1">Teléfono</Form.Label>
                            <Form.Control type="tel" inputMode="numeric" {...register("telefono")} isInvalid={!!errors.telefono} />
                            <Form.Control.Feedback type="invalid"> {errors.telefono?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={6}>
                        <SelectEditable label="Sexo" name="sexo" options={sexoOptions} register={register} error={errors.sexo?.message} />
                    </Col>
                </Row>
                <Row className="g-2 mt-1">
                    <Col md={4}>
                        <SelectEditable label="Obra social" name="obraSocial" options={osValidas} register={register} error={errors.obraSocial?.message} />
                        {/* Solo la secretaria crea obras sociales (POST /api/obras-sociales) */}
                        {tieneRol("SECRETARIA") && (
                            <AgregarObraSocial onCreada={(nueva) => {
                                setObrasAgregadas((prev) => [...prev, nueva]);
                                setValue("obraSocial", nueva.nombre, { shouldValidate: true });
                            }} />
                        )}
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="edit-afiliado">
                            <Form.Label className="d-flex me-auto text-xs mb-1">Nro. afiliado</Form.Label>
                            <Form.Control type="text" placeholder="Ej: A-123456" {...register("nroAfiliado")} onChange={handleMayus} isInvalid={!!errors.nroAfiliado?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.nroAfiliado?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                    <Col md={4}>
                        <Form.Group controlId="edit-plan">
                            <Form.Label className="d-flex me-auto text-xs mb-1">Plan</Form.Label>
                            <Form.Control type="text" placeholder="Ej: 210" {...register("plan")} onChange={handleMayus} isInvalid={!!errors.plan?.message} disabled={sinObraSocial} />
                            <Form.Control.Feedback type="invalid"> {errors.plan?.message} </Form.Control.Feedback>
                        </Form.Group>
                    </Col>
                </Row>
                {/* El formulario se edita directo: Guardar se habilita cuando hay cambios
                    y "Descartar cambios" vuelve a los datos guardados */}
                <div className="perfil-form-acciones">
                    {isDirty && (
                        <Button type="button" variant="outline-secondary" onClick={onCancel} disabled={isSubmitting}>Descartar cambios</Button>
                    )}
                    <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
                        {isSubmitting ? <Spinner size="sm" animation="border" /> : <><Check2 aria-hidden="true" />Guardar cambios</>}
                    </Button>
                </div>
            </Form>
        </div>
    );
}
