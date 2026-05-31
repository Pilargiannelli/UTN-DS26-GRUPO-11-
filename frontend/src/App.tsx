import Header from "./Header";
import Botones from "./botones";
import NavbarLateral from "./NavbarLateral";
<<<<<<< HEAD
import ContadorTurnos from "./ContadorTurnos";
=======
import { TurnosHoy, TurnosPorConfirmar } from "./listas";
import { Container } from 'react-bootstrap';
>>>>>>> f1bacec8d26f481f83c6741b00f3f6010dc42399

function App() {
  return (
    <>
      <Header />

      <div style={{ display: "flex" }}>
        <NavbarLateral
          opciones={[
<<<<<<< HEAD
            "Turnos",
            "Pacientes",
            "Agenda"
          ]}
=======
          "Turnos",
          "Pacientes",
          "Agenda"
        ]}
>>>>>>> f1bacec8d26f481f83c6741b00f3f6010dc42399
        />

        <div style={{ flex: 1 }}>
          <Botones />
<<<<<<< HEAD
          <ContadorTurnos />
=======
          <Container className="mt-5">
            <TurnosHoy />
            <TurnosPorConfirmar />
          </Container>
>>>>>>> f1bacec8d26f481f83c6741b00f3f6010dc42399
        </div>
      </div>
    </>
  );
}

export default App;