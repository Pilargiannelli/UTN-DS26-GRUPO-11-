import { useState } from "react";
import { useForm, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import { apiFetch, ApiError } from "../../services/api";
import type { UsuarioSesion } from "../../types/UsuarioSesion";

// Mismas reglas que perfilUpdateSchema del back
const cuentaSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre es obligatorio"),
  apellido: z.string().trim().min(1, "El apellido es obligatorio"),
  email: z.string().trim().min(1, "El email es obligatorio").email("El email no es válido"),
});

type CuentaForm = z.infer<typeof cuentaSchema>;

interface DatosCuentaFormProps {
  usuario: UsuarioSesion;
  onGuardado: (actualizado: UsuarioSesion) => void;
  onCancelar: () => void;
}

// "Editar" en Datos personales de Mi cuenta: PATCH /api/auth/yo
export function DatosCuentaForm({ usuario, onGuardado, onCancelar }: DatosCuentaFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CuentaForm>({
    resolver: zodResolver(cuentaSchema),
    defaultValues: { nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email },
  });

  const guardar = async (datos: CuentaForm) => {
    setErrorMsg(null);
    try {
      onGuardado(await apiFetch<UsuarioSesion>("/auth/yo", { method: "PATCH", body: JSON.stringify(datos) }));
    } catch (err) {
      // 400 por campo o 409 "El email ya se encuentra registrado"
      (err instanceof ApiError ? err.detalles : []).forEach(({ campo, mensaje }) =>
        setError(campo as Path<CuentaForm>, { message: mensaje })
      );
      if (err instanceof ApiError && err.status === 409) setError("email", { message: err.message });
      else setErrorMsg(err instanceof Error ? err.message : "No se pudieron guardar los cambios");
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit(guardar)}>
      {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}
      <Row className="g-3">
        <Col md={6}>
          <Form.Group controlId="cuenta-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control {...register("nombre")} isInvalid={!!errors.nombre} autoFocus />
            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="cuenta-apellido">
            <Form.Label>Apellido</Form.Label>
            <Form.Control {...register("apellido")} isInvalid={!!errors.apellido} />
            <Form.Control.Feedback type="invalid">{errors.apellido?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={12}>
          <Form.Group controlId="cuenta-email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" {...register("email")} isInvalid={!!errors.email} />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>
      <p className="perfil-nota">El DNI no se puede cambiar desde acá. Si hay un error, comunicate con la secretaría.</p>
      <div className="perfil-form-acciones">
        <Button variant="outline-secondary" onClick={onCancelar} disabled={isSubmitting}>Cancelar</Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? <Spinner size="sm" animation="border" /> : "Guardar cambios"}
        </Button>
      </div>
    </Form>
  );
}
