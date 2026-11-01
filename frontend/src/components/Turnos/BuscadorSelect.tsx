import { useId, useRef, useState } from "react";
import { Search, XLg } from "react-bootstrap-icons";
import "../../assets/styles/BuscadorSelect.css";

export interface OpcionBuscador {
  value: string;
  etiqueta: string;
  detalle?: string;
  // Texto extra sobre el que también se busca (DNI, especialidad...)
  busqueda?: string;
}

interface BuscadorSelectProps {
  opciones: OpcionBuscador[] | undefined;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
  invalido?: boolean;
  // false: siempre queda algo elegido (sin cruz para quitarlo)
  quitable?: boolean;
  // true: el detalle de lo elegido (ej. la especialidad) queda fijo a la derecha
  // y no se borra al editar el texto
  detalleFijo?: boolean;
}

const normalizar = (texto: string) =>
  texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLocaleLowerCase("es-AR").trim();

// Selector con buscador: se escribe para filtrar, se elige de la lista y la
// cruz de la derecha quita lo elegido.
export function BuscadorSelect({ opciones, value, onChange, placeholder, ariaLabel, invalido = false, quitable = true, detalleFijo = false }: BuscadorSelectProps) {
  const idLista = useId();
  const entrada = useRef<HTMLInputElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  const [activa, setActiva] = useState(0);

  const cargando = opciones === undefined;
  const seleccion = (opciones ?? []).find((o) => o.value === value);
  // Con el texto sin tocar (el nombre elegido) se ven todas las opciones
  const buscado = seleccion && texto === seleccion.etiqueta ? "" : normalizar(texto);
  const filtradas = (opciones ?? []).filter((o) =>
    normalizar(`${o.etiqueta} ${o.detalle ?? ""} ${o.busqueda ?? ""}`).includes(buscado));

  const cerrar = () => {
    setAbierto(false);
    setTexto("");
  };

  const elegir = (opcion: OpcionBuscador) => {
    onChange(opcion.value);
    cerrar();
  };

  const quitar = () => {
    onChange("");
    setTexto("");
    entrada.current?.focus();
  };

  const alTeclear = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setAbierto(true);
      setActiva((i) => Math.min(i + 1, filtradas.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiva((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && abierto) {
      e.preventDefault();
      if (filtradas[activa]) elegir(filtradas[activa]);
    } else if (e.key === "Escape") {
      cerrar();
    }
  };

  return (
    <div className={`buscador-select${invalido ? " is-invalid" : ""}${detalleFijo ? " con-detalle" : ""}`}>
      <input
        ref={entrada}
        type="text"
        role="combobox"
        aria-label={ariaLabel}
        aria-expanded={abierto}
        aria-controls={idLista}
        aria-autocomplete="list"
        autoComplete="off"
        className="form-control buscador-select-entrada"
        placeholder={cargando ? "Cargando..." : placeholder}
        value={abierto ? texto : seleccion?.etiqueta ?? ""}
        disabled={cargando}
        onFocus={(e) => {
          setAbierto(true);
          // El nombre elegido queda escrito para poder borrarlo o cambiarlo
          if (seleccion) {
            setTexto(seleccion.etiqueta);
            e.target.select();
          }
        }}
        onBlur={cerrar}
        onChange={(e) => {
          setTexto(e.target.value);
          setActiva(0);
          setAbierto(true);
        }}
        onKeyDown={alTeclear}
      />

      <Search className="buscador-select-lupa" aria-hidden="true" />

      {detalleFijo && seleccion?.detalle && <span className="buscador-select-detalle">{seleccion.detalle}</span>}

      {seleccion && quitable && (
        <button
          type="button"
          className="buscador-select-quitar"
          aria-label={`Quitar ${ariaLabel.toLowerCase()}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={quitar}
        >
          <XLg aria-hidden="true" />
        </button>
      )}

      {abierto && (
        <ul id={idLista} role="listbox" className="buscador-select-lista">
          {filtradas.length === 0 ? (
            <li className="buscador-select-vacio">Sin resultados</li>
          ) : (
            filtradas.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                className={`buscador-select-opcion${i === activa ? " activa" : ""}${o.value === value ? " elegida" : ""}`}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => elegir(o)}
                onMouseEnter={() => setActiva(i)}
              >
                <span>{o.etiqueta}</span>
                {o.detalle && <small>{o.detalle}</small>}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
