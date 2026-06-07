    import { useState } from "react";
    import { useLocation, useNavigate } from "react-router-dom";
    import type { Paciente } from "../types/Paciente";
    import "../assets/styles/App.css";

    const pacienteVacio: Paciente = {
    dni: "",
    nombre: "",
    apellido: "",
    fechaNacimiento: "",
    nacionalidad: "",
    sexo: "",
    telefono: "",
    email: "",
    direccion: "",
    ciudad: "",
    obraSocial: "",
    numeroAfiliado: "",
    plan: "",
    };

    export default function EditarPaciente() {
    const navigate = useNavigate();
    const location = useLocation();

    const pacienteRecibido = location.state?.paciente as Paciente | undefined;

    const [paciente, setPaciente] = useState<Paciente>(
        pacienteRecibido ?? pacienteVacio
    );

    const [datosActuales, setDatosActuales] = useState<Paciente>(
        pacienteRecibido ?? pacienteVacio
    );

    const [errores, setErrores] = useState<
        Partial<Record<keyof Paciente, string>>
    >({});

    const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

    const handleChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = event.target;

        setPaciente((prevPaciente) => ({
        ...prevPaciente,
        [name]: value,
        }));
    };

    const validarFormulario = () => {
        const nuevosErrores: Partial<Record<keyof Paciente, string>> = {};

        const soloLetras = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
        const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telefonoValido = /^[0-9\s\-+()]{6,20}$/;
        const hoy = new Date();
        const fechaNacimiento = paciente.fechaNacimiento
        ? new Date(paciente.fechaNacimiento)
        : null;

        if (!paciente.nombre.trim()) {
        nuevosErrores.nombre = "El nombre es obligatorio";
        } else if (!soloLetras.test(paciente.nombre)) {
        nuevosErrores.nombre = "El nombre solo puede contener letras";
        }

        if (!paciente.apellido.trim()) {
        nuevosErrores.apellido = "El apellido es obligatorio";
        } else if (!soloLetras.test(paciente.apellido)) {
        nuevosErrores.apellido = "El apellido solo puede contener letras";
        }

        if (!paciente.fechaNacimiento.trim()) {
        nuevosErrores.fechaNacimiento = "La fecha de nacimiento es obligatoria";
        } else if (fechaNacimiento && fechaNacimiento > hoy) {
        nuevosErrores.fechaNacimiento = "La fecha no puede ser futura";
        }

        if (!paciente.nacionalidad.trim()) {
        nuevosErrores.nacionalidad = "La nacionalidad es obligatoria";
        } else if (!soloLetras.test(paciente.nacionalidad)) {
        nuevosErrores.nacionalidad = "La nacionalidad solo puede contener letras";
        }

        if (!paciente.sexo.trim()) {
        nuevosErrores.sexo = "Debe seleccionar una opcion";
        }

        if (!paciente.telefono.trim()) {
        nuevosErrores.telefono = "El telefono es obligatorio";
        } else if (!telefonoValido.test(paciente.telefono)) {
        nuevosErrores.telefono = "Ingrese un telefono valido";
        }

        if (!paciente.email.trim()) {
        nuevosErrores.email = "El email es obligatorio";
        } else if (!emailValido.test(paciente.email)) {
        nuevosErrores.email = "Ingrese un email valido";
        }

        if (!paciente.direccion.trim()) {
        nuevosErrores.direccion = "La direccion es obligatoria";
        }

        if (!paciente.ciudad.trim()) {
        nuevosErrores.ciudad = "La ciudad es obligatoria";
        } else if (!soloLetras.test(paciente.ciudad)) {
        nuevosErrores.ciudad = "La ciudad solo puede contener letras";
        }

        if (!paciente.obraSocial.trim()) {
        nuevosErrores.obraSocial = "La obra social es obligatoria";
        }

        if (!paciente.numeroAfiliado.trim()) {
        nuevosErrores.numeroAfiliado = "El numero de afiliado es obligatorio";
        }

        if (!paciente.plan.trim()) {
        nuevosErrores.plan = "El plan es obligatorio";
        }

        setErrores(nuevosErrores);

        return Object.keys(nuevosErrores).length === 0;
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!validarFormulario()) {
        return;
        }

        setMostrarConfirmacion(true);
    };

    const confirmarGuardado = () => {
        setDatosActuales(paciente);
        setMostrarConfirmacion(false);
    };

    return (
        <div className="editar-paciente-page">
        <header className="editar-paciente-topbar">
            <h1>IMOS</h1>
        </header>

        <main className="editar-paciente-main">
            <div className="contenedor-volver">
            <button
                className="btn-volver"
                type="button"
                onClick={() => navigate(-1)}
            >
                &lt; Volver
            </button>
            </div>

            <section className="editar-paciente-card">
            <h2>Editar paciente existente</h2>

            <form onSubmit={handleSubmit}>
                <section className="form-section">
                <h3>Datos personales</h3>

                <div className="form-grid">
                    <div className="form-group">
                    <label htmlFor="nombre">Nombre *</label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={paciente.nombre}
                        onChange={handleChange}
                        placeholder="Ej: Ana"
                    />
                    {errores.nombre && <span>{errores.nombre}</span>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="apellido">Apellido *</label>
                    <input
                        id="apellido"
                        name="apellido"
                        type="text"
                        value={paciente.apellido}
                        onChange={handleChange}
                        placeholder="Ej: Perez"
                    />
                    {errores.apellido && <span>{errores.apellido}</span>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="fechaNacimiento">Fecha de nacimiento *</label>
                    <input
                        id="fechaNacimiento"
                        name="fechaNacimiento"
                        type="date"
                        value={paciente.fechaNacimiento}
                        onChange={handleChange}
                    />
                    {errores.fechaNacimiento && (
                        <span>{errores.fechaNacimiento}</span>
                    )}
                    </div>

                    <div className="form-group">
                    <label htmlFor="dni">DNI</label>
                    <input
                        id="dni"
                        name="dni"
                        type="text"
                        value={paciente.dni}
                        placeholder="Ej: 32123456"
                        disabled
                    />
                    </div>

                    <div className="form-group">
                    <label htmlFor="nacionalidad">Nacionalidad *</label>
                    <input
                        id="nacionalidad"
                        name="nacionalidad"
                        type="text"
                        value={paciente.nacionalidad}
                        onChange={handleChange}
                        placeholder="Ej: Argentina"
                    />
                    {errores.nacionalidad && <span>{errores.nacionalidad}</span>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="sexo">Sexo *</label>
                    <select
                        id="sexo"
                        name="sexo"
                        value={paciente.sexo}
                        onChange={handleChange}
                    >
                        <option value="">Selecciona una opcion</option>
                        <option value="Hombre">Hombre</option>
                        <option value="Mujer">Mujer</option>
                        <option value="Otro">Otro</option>
                    </select>
                    {errores.sexo && <span>{errores.sexo}</span>}
                    </div>
                </div>
                </section>

                <section className="form-section">
                <h3>Contacto</h3>

                <div className="form-grid">
                    <div className="form-group">
                    <label htmlFor="telefono">Telefono *</label>
                    <input
                        id="telefono"
                        name="telefono"
                        type="text"
                        value={paciente.telefono}
                        onChange={handleChange}
                        placeholder="Ej: 11-4567-8901"
                    />
                    {errores.telefono && <span>{errores.telefono}</span>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={paciente.email}
                        onChange={handleChange}
                        placeholder="Ej: paciente@correo.com"
                    />
                    {errores.email && <span>{errores.email}</span>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="direccion">Direccion *</label>
                    <input
                        id="direccion"
                        name="direccion"
                        type="text"
                        value={paciente.direccion}
                        onChange={handleChange}
                        placeholder="Ej: Av. Siempre Viva 742"
                    />
                    {errores.direccion && <span>{errores.direccion}</span>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="ciudad">Ciudad *</label>
                    <input
                        id="ciudad"
                        name="ciudad"
                        type="text"
                        value={paciente.ciudad}
                        onChange={handleChange}
                        placeholder="Ej: Buenos Aires"
                    />
                    {errores.ciudad && <span>{errores.ciudad}</span>}
                    </div>
                </div>
                </section>

                <section className="form-section">
                <h3>Cobertura medica</h3>

                <div className="form-grid">
                    <div className="form-group">
                    <label htmlFor="obraSocial">Obra social *</label>
                    <input
                        id="obraSocial"
                        name="obraSocial"
                        type="text"
                        value={paciente.obraSocial}
                        onChange={handleChange}
                        placeholder="Ej: OSDE"
                    />
                    {errores.obraSocial && <span>{errores.obraSocial}</span>}
                    </div>

                    <div className="form-group">
                    <label htmlFor="numeroAfiliado">Numero de afiliado *</label>
                    <input
                        id="numeroAfiliado"
                        name="numeroAfiliado"
                        type="text"
                        value={paciente.numeroAfiliado}
                        onChange={handleChange}
                        placeholder="Ej: A-123456"
                    />
                    {errores.numeroAfiliado && (
                        <span>{errores.numeroAfiliado}</span>
                    )}
                    </div>

                    <div className="form-group">
                    <label htmlFor="plan">Plan *</label>
                    <input
                        id="plan"
                        name="plan"
                        type="text"
                        value={paciente.plan}
                        onChange={handleChange}
                        placeholder="Ej: 210"
                    />
                    {errores.plan && <span>{errores.plan}</span>}
                    </div>
                </div>
                </section>

                <div className="form-actions">
                <button className="btn-guardar" type="submit">
                    Guardar cambios
                </button>
                </div>
            </form>
            </section>

            <section className="datos-actuales-card">
            <h2>Datos actuales del paciente</h2>

            <div className="datos-actuales-grid">
                <p>
                <strong>Nombre:</strong> {datosActuales.nombre}{" "}
                {datosActuales.apellido}
                </p>
                <p>
                <strong>DNI:</strong> {datosActuales.dni}
                </p>
                <p>
                <strong>Nacionalidad:</strong> {datosActuales.nacionalidad}
                </p>
                <p>
                <strong>Sexo:</strong> {datosActuales.sexo}
                </p>
                <p>
                <strong>Telefono:</strong> {datosActuales.telefono}
                </p>
                <p>
                <strong>Email:</strong> {datosActuales.email}
                </p>
                <p>
                <strong>Direccion:</strong> {datosActuales.direccion}
                {datosActuales.ciudad ? `, ${datosActuales.ciudad}` : ""}
                </p>
                <p>
                <strong>Obra social:</strong> {datosActuales.obraSocial}
                </p>
                <p>
                <strong>Numero de afiliado:</strong>{" "}
                {datosActuales.numeroAfiliado}
                </p>
                <p>
                <strong>Plan:</strong> {datosActuales.plan}
                </p>
            </div>
            </section>
        </main>

        {mostrarConfirmacion && (
            <div className="modal-overlay">
            <div className="modal-confirmacion">
                <h2>Confirmar cambios</h2>
                <p>Estas seguro de guardar los cambios del paciente?</p>

                <div className="modal-actions">
                <button
                    className="btn-modal-cancelar"
                    type="button"
                    onClick={() => setMostrarConfirmacion(false)}
                >
                    Cancelar
                </button>

                <button
                    className="btn-modal-aceptar"
                    type="button"
                    onClick={confirmarGuardado}
                >
                    Aceptar
                </button>
                </div>
            </div>
            </div>
        )}
        </div>
    );
    }