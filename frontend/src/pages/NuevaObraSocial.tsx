import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, Button, Form, Spinner } from "react-bootstrap";
import Layout from "../components/Layout/Layout";
import { useFetch } from "../hooks/useFetch";
import { apiFetch } from "../services/api";
import type { ObraSocial } from "../types/Paciente";
import "../assets/styles/NuevaObraSocial.css";

// Misma regla que obraSocialCreateSchema del back
const obraSocialSchema = z.object({
  nombre: z.string().trim().min(1, "El nombre de la obra social es obligatorio"),
});

type ObraSocialForm = z.infer<typeof obraSocialSchema>;

// Alta de obras sociales (solo SECRETARIA: la ruta lo restringe y el back
// responde 403 a cualquier otro rol)
function NuevaObraSocial() {
  const { data, loading, error } = useFetch<ObraSocial[]>("/obras-sociales");
  const [agregadas, setAgregadas] = useState<ObraSocial[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [creada, setCreada] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ObraSocialForm>({
    resolver: zodResolver(obraSocialSchema),
    defaultValues: { nombre: "" },
  });

  const obrasSociales = [...(data ?? []), ...agregadas].sort((a, b) => a.nombre.localeCompare(b.nombre));

  const onSubmit = async ({ nombre }: ObraSocialForm) => {
    setErrorMsg(null);
    setCreada(null);
    try {
      const nueva = await apiFetch<ObraSocial>("/obras-sociales", {
        method: "POST",
        body: JSON.stringify({ nombre }),
      });
      setAgregadas((prev) => [...prev, nueva]);
      setCreada(nueva.nombre);
      reset();
    } catch (err) {
      // 409 si ya existe una con ese nombre (P2002 en el back)
      setErrorMsg(err instanceof Error ? err.message : "No se pudo crear la obra social");
    }
  };

  return (
    <Layout>
      <section className="obra-social-pagina">
        <h1 className="obra-social-titulo">Nueva obra social</h1>

        <Form noValidate onSubmit={handleSubmit(onSubmit)} className="obra-social-card">
          {creada && <Alert variant="success">Se agregó "{creada}".</Alert>}
          {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

          <Form.Group className="mb-3" controlId="obra-social-nombre">
            <Form.Label>Nombre</Form.Label>
            <Form.Control type="text" placeholder="Ej: IOMA" {...register("nombre")} isInvalid={!!errors.nombre} />
            <Form.Control.Feedback type="invalid">{errors.nombre?.message}</Form.Control.Feedback>
          </Form.Group>

          <Button type="submit" variant="success" disabled={isSubmitting}>
            {isSubmitting ? <Spinner size="sm" animation="border" /> : "Agregar"}
          </Button>
        </Form>

        <h2 className="obra-social-subtitulo">Obras sociales cargadas</h2>
        {loading && <Spinner animation="border" size="sm" />}
        {error && <Alert variant="danger">{error.message}</Alert>}
        {!loading && !error && obrasSociales.length === 0 && (
          <p className="text-muted">Todavía no hay obras sociales cargadas.</p>
        )}
        <ul className="obra-social-lista">
          {obrasSociales.map((os) => <li key={os.id}>{os.nombre}</li>)}
        </ul>
      </section>
    </Layout>
  );
}

export default NuevaObraSocial;
