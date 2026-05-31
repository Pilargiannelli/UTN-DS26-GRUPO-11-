import Header from "./Header";
import Botones from "./botones";
import NavbarLateral from "./NavbarLateral";

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
  </div>
</div>
    </>
  );
}

export default App;