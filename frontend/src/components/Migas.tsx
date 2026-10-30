import { Link } from "react-router-dom";
import "../assets/styles/Migas.css";

interface Miga {
  texto: string;
  // Sin destino: es la página actual
  a?: string;
}

// Ruta de navegación ("Pacientes › María Flores"): dice dónde estás y deja
// volver a cualquier nivel anterior
export function Migas({ items }: { items: Miga[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="migas">
      <ol>
        {items.map((m, i) => (
          <li key={`${m.texto}-${i}`}>
            {m.a ? <Link to={m.a}>{m.texto}</Link> : <span aria-current="page">{m.texto}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
