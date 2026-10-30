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
}

// Datos personales de Mi cuenta, editables directo (PATCH /api/auth/yo).
// "Guardar cambios" se habilita cuando hay cambios; "Descartar" vuelve atrás.
export function DatosCuentaForm({ usuario, onGuardado }: DatosCuentaFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, setError, reset, formState: { errors, isSubmitting, isDirty } } = useForm<CuentaForm>({
    resolver: zodResolver(cuentaSchema),
    defaultValues: { nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email },
  });

  const guardar = async (datos: CuentaForm) => {
    setErrorMsg(null);
    try {
      const actualizado = await apiFetch<UsuarioSesion>("/auth/yo", { method: "PATCH", body: JSON.stringify(datos) });
      // Lo guardado pasa a ser el punto de partida (vuelve a deshabilitar Guardar)
      reset({ nombre: actualizado.nombre, apellido: actualizado.apellido, email: actualizado.email });
      onGuardado(actualizado);
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
            <Form.Control {...register("nombre")} isInvalid={!!errors.nombre} />
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
        <Col md={6}>
          <Form.Group controlId="cuenta-email">
            <Form.Label>Email</Form.Label>
            <Form.Control type="email" {...register("email")} isInvalid={!!errors.email} />
            <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group controlId="cuenta-dni">
            <Form.Label>DNI</Form.Label>
            <Form.Control value={usuario.dni} disabled readOnly />
            <Form.Text>Para corregirlo, comunicate con la secretaría.</Form.Text>
          </Form.Group>
        </Col>
      </Row>
      <div className="perfil-form-acciones">
        {isDirty && (
          <Button variant="outline-secondary" onClick={() => reset()} disabled={isSubmitting}>Descartar cambios</Button>
        )}
        <Button type="submit" variant="primary" disabled={isSubmitting || !isDirty}>
          {isSubmitting ? <Spinner size="sm" animation="border" /> : "Guardar cambios"}
        </Button>
      </div>
    </Form>
  );
}
