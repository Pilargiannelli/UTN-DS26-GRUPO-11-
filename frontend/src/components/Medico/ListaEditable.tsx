import { useState } from "react";
import { Button, Form, Spinner } from "react-bootstrap";
import { PencilSquare, X } from "react-bootstrap-icons";

interface ListaEditableProps {
  titulo: string;
  items: string[];
  // "alerta" (alergias, en rojo) o "neutro" (antecedentes)
  tono: "alerta" | "neutro";
  vacio: string;
  onGuardar: (items: string[]) => Promise<void>;
}

// Lista de etiquetas (alergias, antecedentes) que el médico edita en el lugar:
// quita con la X, agrega escribiendo, y guarda o descarta
export function ListaEditable({ titulo, items, tono, vacio, onGuardar }: ListaEditableProps) {
  const [editando, setEditando] = useState(false);
  const [borrador, setBorrador] = useState<string[]>(items);
  const [nuevo, setNuevo] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const empezar = () => {
    setBorrador(items);
    setNuevo("");
    setError(null);
    setEditando(true);
  };

  const agregar = () => {
    const texto = nuevo.trim();
    if (texto && !borrador.some((b) => b.toLowerCase() === texto.toLowerCase())) {
      setBorrador([...borrador, texto]);
    }
    setNuevo("");
  };

  const guardar = async () => {
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(borrador);
      setEditando(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron guardar los cambios");
    } finally {
      setGuardando(false);
    }
  };

  const lista = editando ? borrador : items;

  return (
    <div className="lista-editable">
      <div className="lista-editable-encabezado">
        <h3 className="lista-editable-titulo">{titulo}</h3>
        {!editando && (
          <Button variant="link" size="sm" className="p-0" onClick={empezar} aria-label={`Editar ${titulo.toLowerCase()}`}>
            <PencilSquare aria-hidden="true" /> Editar
          </Button>
        )}
      </div>

      {lista.length === 0 && !editando ? (
        <p className="lista-editable-vacia">{vacio}</p>
      ) : (
        <ul className="lista-editable-chips">
          {lista.map((item) => (
            <li key={item} className={`lista-editable-chip lista-editable-chip-${tono}`}>
              {item}
              {editando && (
                <button
                  type="button"
                  className="lista-editable-quitar"
                  onClick={() => setBorrador(borrador.filter((b) => b !== item))}
                  aria-label={`Quitar ${item}`}
                >
                  <X aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editando && (
        <>
          <div className="lista-editable-agregar">
            <Form.Label htmlFor={`agregar-${titulo}`} className="visually-hidden">Agregar a {titulo.toLowerCase()}</Form.Label>
            <Form.Control
              id={`agregar-${titulo}`}
              size="sm"
              placeholder="Escribí y apretá Enter"
              value={nuevo}
              onChange={(e) => setNuevo(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  agregar();
                }
              }}
            />
            <Button size="sm" variant="outline-primary" onClick={agregar}>Agregar</Button>
          </div>
          {error && <div className="text-danger small mt-1" role="alert">{error}</div>}
          <div className="lista-editable-acciones">
            <Button size="sm" variant="outline-secondary" onClick={() => setEditando(false)} disabled={guardando}>Descartar</Button>
            <Button size="sm" variant="primary" onClick={guardar} disabled={guardando}>
              {guardando ? <Spinner size="sm" animation="border" /> : "Guardar"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
