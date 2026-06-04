import Button from "react-bootstrap/Button";

function Botones() {
  const crearTurno = () => {
    // implementacion futura, por ahora no hace nada este boton
  };

  const crearPaciente = () => {
    // implementacion futura, por ahora no hace nada este boton
  };

  return (
    <div className="contenedor-botones">
      <Button variant="secondary" className="boton-accion" onClick={crearTurno}>
        Crear Turno
      </Button>

      <Button variant="secondary" className="boton-accion" onClick={crearPaciente}>
        Crear Paciente
      </Button>
    </div>
  );
}

export default Botones;