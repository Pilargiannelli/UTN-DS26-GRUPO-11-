import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Form, Spinner } from "react-bootstrap";
import "../assets/styles/HistorialClinico.css";

// Mismas reglas que historiaClinica.validation.ts del back
const entradaSchema = z.object({
  diagnostico: z.string().trim().min(1, "El diagnóstico es obligatorio"),
  evolucion: z.string().trim().min(1, "La evolución es obligatoria"),
  observaciones: z.string().trim(),
});

type EntradaForm = z.infer<typeof entradaSchema>;

interface NuevaEntradaFormProps {
  onGuardar: (datos: EntradaForm) => Promise<void>;
  onCancelar?: () => void;
}

// Formulario "Nueva consulta" del médico (HU-004)
export function NuevaEntradaForm({ onGuardar, onCancelar }: NuevaEntradaFormProps) {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<EntradaForm>({
    resolver: zodResolver(entradaSchema),
    defaultValues: { diagnostico: "", evolucion: "", observaciones: "" },
  });

  const onSubmit = async (datos: EntradaForm) => {
    setErrorMsg(null);
    try {
      await onGuardar(datos);
      reset();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "No se pudo guardar la consulta");
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit(onSubmit)} className="histcli-form">
      <h3 className="histcli-subtitulo">Nueva consulta</h3>
      {errorMsg && <div className="alert alert-danger" role="alert">{errorMsg}</div>}

      <Form.Group className="mb-4" controlId="entrada-diagnostico">
        <Form.Label>Diagnóstico</Form.Label>
        <Form.Control type="text" {...register("diagnostico")} isInvalid={!!errors.diagnostico} />
        <Form.Control.Feedback type="invalid">{errors.diagnostico?.message}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="entrada-evolucion">
        <Form.Label>Evolución e indicaciones</Form.Label>
        <Form.Control as="textarea" rows={6} {...register("evolucion")} isInvalid={!!errors.evolucion} />
        <Form.Control.Feedback type="invalid">{errors.evolucion?.message}</Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-4" controlId="entrada-observaciones">
        <Form.Label>Observaciones (opcional)</Form.Label>
        <Form.Control as="textarea" rows={3} {...register("observaciones")} />
      </Form.Group>

      <Button type="submit" variant="success" disabled={isSubmitting} className="w-100">
        {isSubmitting ? <Spinner size="sm" animation="border" /> : "Guardar consulta"}
      </Button>
      {onCancelar && (
        <Button type="button" variant="outline-success" onClick={onCancelar} disabled={isSubmitting} className="w-100 mt-2">
          Cancelar
        </Button>
      )}
    </Form>
  );
}
