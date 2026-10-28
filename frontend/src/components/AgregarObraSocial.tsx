import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { apiFetch } from "../services/api";
import type { ObraSocial } from "../types/Paciente";

interface AgregarObraSocialProps {
  // La obra social recién creada, para sumarla a la lista y seleccionarla
  onCreada: (obraSocial: ObraSocial) => void;
}

// "+ Agregar obra social" dentro del formulario del paciente: la secretaria la
// da de alta en el momento en que la necesita (POST /api/obras-sociales, solo
// SECRETARIA). No es un <form> propio porque vive dentro de otro formulario.
export function AgregarObraSocial({ onCreada }: AgregarObraSocialProps) {
  const [abierto, setAbierto] = useState(false);
  const [nombre, setNombre] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cerrar = () => {
    setAbierto(false);
    setNombre("");
    setError(null);
  };

  const agregar = async () => {
    if (!nombre.trim()) {
      setError("Escribí el nombre de la obra social");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      const nueva = await apiFetch<ObraSocial>("/obras-sociales", {
        method: "POST",
        body: JSON.stringify({ nombre: nombre.trim() }),
      });
      onCreada(nueva);
      cerrar();
    } catch (err) {
      // 409 si ya existe una con ese nombre
      setError(err instanceof Error ? err.message : "No se pudo agregar la obra social");
    } finally {
      setGuardando(false);
    }
  };

  if (!abierto) {
    return (
      <Button variant="link" size="sm" className="p-0 mt-1" onClick={() => setAbierto(true)}>
        + Agregar obra social
      </Button>
    );
  }

  return (
    <div className="mt-2">
      <Form.Label htmlFor="nueva-obra-social" className="visually-hidden">Nombre de la obra social nueva</Form.Label>
      <div className="d-flex gap-2">
        <Form.Control
          id="nueva-obra-social"
          size="sm"
          placeholder="Ej: IOMA"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          // Enter agrega la obra social en vez de enviar el formulario del paciente
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void agregar();
            }
          }}
          isInvalid={!!error}
          autoFocus
        />
        <Button size="sm" variant="success" onClick={agregar} disabled={guardando}>
          {guardando ? <Spinner size="sm" animation="border" /> : "Agregar"}
        </Button>
        <Button size="sm" variant="outline-secondary" onClick={cerrar} disabled={guardando}>
          Cancelar
        </Button>
      </div>
      {error && <div className="text-danger small mt-1" role="alert">{error}</div>}
    </div>
  );
}
