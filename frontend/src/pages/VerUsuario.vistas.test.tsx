import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../context/AuthContextBase";

vi.mock("../components/Layout/Layout.tsx", () => ({ default: ({ children }: { children: React.ReactNode }) => <div>{children}</div> }));
vi.mock("../components/Perfil/DatosCuentaForm.tsx", () => ({
  DatosCuentaForm: ({ onGuardado }: { onGuardado: (u: unknown) => void }) => (
    <button onClick={() => onGuardado({ nombre: "Anita" })}>guardar cuenta</button>
  ),
}));
vi.mock("../components/Perfil/ProximosTurnosPaciente.tsx", () => ({
  ProximosTurnosPaciente: ({ pacienteId }: { pacienteId: number }) => <p>próximos turnos de {pacienteId}</p>,
}));
vi.mock("../components/CambiarPasswordForm.tsx", () => ({
  NewPasswordForm: ({ onListo }: { onListo: () => void }) => <button onClick={onListo}>cambiar contraseña</button>,
}));
vi.mock("../components/PacienteFormFields.tsx", () => ({
  PacienteFormFields: ({ onSave, onCancel }: { onSave: (u: unknown) => void; onCancel: () => void }) => (
    <div>
      <button onClick={() => onSave({ id: 3, nombre: "Editado" })}>guardar ficha</button>
      <button onClick={onCancel}>descartar ficha</button>
    </div>
  ),
}));
vi.mock("../components/HistorialMedicoCard.tsx", () => ({
  HistorialMedicoCard: ({ pacienteId }: { pacienteId: number }) => <p>historia clínica de {pacienteId}</p>,
}));
vi.mock("../components/Turnos/NuevoTurnoModal.tsx", () => ({
  default: ({ pacienteIdInicial, onClose, onAgregar }: { pacienteIdInicial: number; onClose: () => void; onAgregar: () => void }) => (
    <div>
      <p>dar turno a {pacienteIdInicial}</p>
      <button onClick={onAgregar}>turno creado</button>
      <button onClick={onClose}>cerrar turno</button>
    </div>
  ),
}));

import VerUsuario from "./VerUsuario";

const paciente = (extra = {}) => ({
  id: 3,
  rol: "PACIENTE",
  nombre: "Ana",
  apellido: "Pérez",
  dni: "30111222",
  email: "ana@imos.test",
  paciente: {
    id: 9,
    telefono: "2344111111",
    sexo: "Femenino",
    fechaNacimiento: "1990-03-05T00:00:00.000Z",
    coberturas: [],
  },
  ...extra,
});

const medico = { id: 4, rol: "MEDICO", nombre: "Carlos", apellido: "Gómez", dni: "20111222", email: "c@imos.test", medico: { id: 2, especialidad: "Cardiología", matricula: "MP-1" } };

type Props = React.ComponentProps<typeof VerUsuario>;

function renderPerfil(sesion: Record<string, unknown> | null, props: Props = {}) {
  const setUsuario = vi.fn();
  const rol = (sesion?.rol as string) ?? null;
  const auth = {
    usuario: sesion,
    setUsuario,
    tieneRol: (r: string) => r === rol,
  } as unknown as AuthContextType;
  render(
    <AuthContext.Provider value={auth}>
      <MemoryRouter>
        <VerUsuario {...props} />
      </MemoryRouter>
    </AuthContext.Provider>
  );
  return { setUsuario };
}

const tab = (nombre: string) => screen.queryByRole("tab", { name: nombre });

describe("VerUsuario: qué ve cada uno", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("sin sesión ni perfil elegido avisa que no hay a quién mostrar", () => {
    renderPerfil(null);

    expect(screen.getByText("No hay usuario seleccionado ni sesión activa.")).toBeInTheDocument();
  });

  describe("el paciente en Mi cuenta (propio)", () => {
    it("ve sus pestañas: datos, ficha, historia clínica y seguridad, pero no próximos turnos", () => {
      renderPerfil(paciente(), { propio: true });

      expect(tab("Datos personales")).toBeInTheDocument();
      expect(tab("Mi ficha")).toBeInTheDocument();
      expect(tab("Historia clínica")).toBeInTheDocument();
      expect(tab("Seguridad")).toBeInTheDocument();
      expect(tab("Próximos turnos")).not.toBeInTheDocument();
    });

    it("el encabezado lo identifica como 'Mi cuenta · Paciente' y no ofrece volver ni dar turno", () => {
      renderPerfil(paciente(), { propio: true });

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Ana Pérez");
      expect(screen.getByText("Mi cuenta · Paciente")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Volver" })).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Dar turno/ })).not.toBeInTheDocument();
    });

    it("al guardar sus datos actualiza la sesión y avisa", async () => {
      const { setUsuario } = renderPerfil(paciente(), { propio: true });

      fireEvent.click(screen.getByRole("button", { name: "guardar cuenta" }));

      expect(setUsuario).toHaveBeenCalledWith(expect.objectContaining({ id: 3, nombre: "Anita" }));
      expect(await screen.findByText("Datos actualizados correctamente")).toBeInTheDocument();
    });

    it("'Mi ficha' muestra teléfono, sexo, nacimiento con edad y 'Sin obra social'", () => {
      renderPerfil(paciente(), { propio: true });

      fireEvent.click(tab("Mi ficha")!);

      expect(screen.getByText("2344111111", { selector: "dd" })).toBeInTheDocument();
      expect(screen.getByText("Femenino")).toBeInTheDocument();
      expect(screen.getByText(/05\/03\/1990 \(\d+ años\)/)).toBeInTheDocument();
      expect(screen.getByText("Sin obra social")).toBeInTheDocument();
    });

    it("'Mi ficha' con cobertura muestra obra social, plan y afiliado", () => {
      const conOS = paciente();
      conOS.paciente.coberturas = [{ plan: "210", nroAfiliado: "A-1", obraSocial: { nombre: "OSDE" } }] as never;
      renderPerfil(conOS, { propio: true });

      fireEvent.click(tab("Mi ficha")!);

      expect(screen.getByText("OSDE · Plan 210 · Afiliado A-1")).toBeInTheDocument();
    });

    it("la pestaña Historia clínica muestra la de su ficha", () => {
      renderPerfil(paciente(), { propio: true });

      fireEvent.click(tab("Historia clínica")!);

      expect(screen.getByText("historia clínica de 9")).toBeInTheDocument();
    });

    it("cambiar la contraseña avisa 'Contraseña actualizada'", async () => {
      renderPerfil(paciente(), { propio: true });
      fireEvent.click(tab("Seguridad")!);

      fireEvent.click(screen.getByRole("button", { name: "cambiar contraseña" }));

      expect(await screen.findByText("Contraseña actualizada")).toBeInTheDocument();
    });
  });

  describe("la secretaria viendo a un paciente", () => {
    const secretaria = { id: 1, rol: "SECRETARIA", nombre: "Sol", apellido: "Ríos", dni: "1", email: "s@imos.test" };

    it("edita sus datos, ve sus próximos turnos y puede darle turno; no ve su historia clínica", () => {
      renderPerfil(secretaria, { perfilPaciente: paciente() as never });

      expect(tab("Datos del paciente")).toBeInTheDocument();
      expect(tab("Próximos turnos")).toBeInTheDocument();
      expect(tab("Historia clínica")).not.toBeInTheDocument();
      expect(tab("Seguridad")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Dar turno/ })).toBeInTheDocument();
    });

    it("con 'perfilPaciente' y callback, guardar la ficha avisa al padre y al usuario", async () => {
      const onPerfilActualizado = vi.fn();
      renderPerfil(secretaria, { perfilPaciente: paciente() as never, onPerfilActualizado });

      fireEvent.click(screen.getByRole("button", { name: "guardar ficha" }));

      expect(onPerfilActualizado).toHaveBeenCalledWith({ id: 3, nombre: "Editado" });
      expect(await screen.findByText("Datos del paciente actualizados")).toBeInTheDocument();
    });

    it("sin callback, guarda al paciente editado como perfil seleccionado", () => {
      renderPerfil(secretaria, { perfilPaciente: paciente() as never });

      fireEvent.click(screen.getByRole("button", { name: "guardar ficha" }));

      expect(JSON.parse(localStorage.getItem("usuarioSeleccionado")!)).toEqual({ id: 3, nombre: "Editado" });
    });

    it("descartar vuelve a montar el formulario (queda con los datos guardados)", () => {
      renderPerfil(secretaria, { perfilPaciente: paciente() as never });

      fireEvent.click(screen.getByRole("button", { name: "descartar ficha" }));

      expect(screen.getByRole("button", { name: "guardar ficha" })).toBeInTheDocument();
    });

    it("'Dar turno' abre el modal con el paciente elegido y al agendar avisa", async () => {
      renderPerfil(secretaria, { perfilPaciente: paciente() as never });

      fireEvent.click(screen.getByRole("button", { name: /Dar turno/ }));
      expect(screen.getByText("dar turno a 9")).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "turno creado" }));
      expect(await screen.findByText("Turno agendado")).toBeInTheDocument();
    });

    it("cerrar el modal lo saca", () => {
      renderPerfil(secretaria, { perfilPaciente: paciente() as never });
      fireEvent.click(screen.getByRole("button", { name: /Dar turno/ }));

      fireEvent.click(screen.getByRole("button", { name: "cerrar turno" }));

      expect(screen.queryByText("dar turno a 9")).not.toBeInTheDocument();
    });

    it("la pestaña de turnos muestra los del paciente", () => {
      renderPerfil(secretaria, { perfilPaciente: paciente() as never });

      fireEvent.click(tab("Próximos turnos")!);

      expect(screen.getByText("próximos turnos de 9")).toBeInTheDocument();
    });

    it("muestra las migas que recibe en lugar del botón Volver", () => {
      renderPerfil(secretaria, { perfilPaciente: paciente() as never, migas: <nav>migas de prueba</nav> });

      expect(screen.getByText("migas de prueba")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Volver" })).not.toBeInTheDocument();
    });
  });

  describe("el médico", () => {
    const sesionMedico = { ...medico };

    it("viendo a un paciente accede a su historia clínica y sus turnos, pero no a darle turno", () => {
      renderPerfil(sesionMedico, { perfilPaciente: paciente() as never });

      expect(tab("Historia clínica")).toBeInTheDocument();
      expect(tab("Próximos turnos")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Dar turno/ })).not.toBeInTheDocument();
      expect(tab("Datos del paciente")).not.toBeInTheDocument();
    });

    it("ve los datos del paciente en solo lectura", () => {
      renderPerfil(sesionMedico, { perfilPaciente: paciente() as never });

      expect(screen.getByText("30111222")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "guardar ficha" })).not.toBeInTheDocument();
    });
  });

  describe("un profesional visto por otro usuario", () => {
    it("muestra especialidad y matrícula, y oculta la barra de pestañas (hay una sola)", () => {
      localStorage.setItem("usuarioSeleccionado", JSON.stringify(medico));
      const sesion = { id: 3, rol: "PACIENTE", nombre: "Ana", apellido: "Pérez", dni: "1", email: "a@b.co" };

      renderPerfil(sesion);

      expect(screen.getByText("Cardiología")).toBeInTheDocument();
      expect(screen.getByText("MP-1")).toBeInTheDocument();
      expect(screen.getByRole("tablist")).toHaveClass("perfil-tabs-ocultas");
      expect(screen.getByRole("button", { name: "Volver" })).toBeInTheDocument();
    });
  });
});
