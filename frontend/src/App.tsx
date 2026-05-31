import Header from "./Header";
import Botones from "./botones";
import NavbarLateral from "./NavbarLateral";
import ListaReservados from "./ListaReservados";
import ContadorTurnos from "./ContadorTurnos";
import { TurnosHoy, TurnosPorConfirmar } from "./listas";
import { Container } from 'react-bootstrap';

function App() {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <NavbarLateral
          opciones={[
            "Turnos",
            "Pacientes",
            "Agenda"
          ]}
        />

        <div style={{ flex: 1 }}>
          <Botones />
          <ListaReservados />
          <ContadorTurnos />
          <Container className="mt-5">
            <TurnosHoy />
            <TurnosPorConfirmar />
          </Container>
        </div>
      </div>
    </>
  );
}

export default App;