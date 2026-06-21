import { useState } from "react";
import imosLogo from "../assets/img/IMOS_LOGO.png";
import "../assets/styles/App.css";

const USERS = [
  { u: "medico1", p: "med123", rol: "medico" },
  { u: "admin1", p: "adm123", rol: "admin" },
  { u: "paciente1", p: "pac123", rol: "paciente" },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [fieldErr, setFieldErr] = useState({ u: false, p: false });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const clearErrors = () => {
    setAuthError(false);
    setFieldErr({ u: false, p: false });
  };

  const handleLogin = () => {
    clearErrors();

    const hasErrU = !username.trim();
    const hasErrP = !password;

    if (hasErrU || hasErrP) {
      setFieldErr({ u: hasErrU, p: hasErrP });
      setAuthError(true);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const found = USERS.find(
        (x) => x.u === username.trim() && x.p === password
      );

      setLoading(false);

      if (found) {
        setSuccess(true);
        setUsername("");
        setPassword("");
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setAuthError(true);
        setPassword("");
      }
    }, 400);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <section className="login-brand">
          <img className="login-logo-img" src={imosLogo} alt="IMOS" />
        </section>

        <section className="login-form-panel">
          <h1 className="login-title">Login</h1>
          <p className="login-subtitle">
            Ingresá tus credenciales para continuar
          </p>

          <div className="login-field">
            <label className="login-label" htmlFor="inp-user">
              Email / Nombre de usuario
            </label>
            <input
              id="inp-user"
              className={`login-input ${
                fieldErr.u || authError ? "login-input-error" : ""
              }`}
              type="text"
              value={username}
              placeholder="email / nombre usuario"
              autoComplete="username"
              onChange={(e) => {
                setUsername(e.target.value);
                clearErrors();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  document.getElementById("inp-pass")?.focus();
                }
              }}
            />
          </div>

          <div className="login-field">
            <label className="login-label" htmlFor="inp-pass">
              Contraseña
            </label>
            <input
              id="inp-pass"
              className={`login-input ${
                fieldErr.p || authError ? "login-input-error" : ""
              }`}
              type="password"
              value={password}
              placeholder="contraseña"
              autoComplete="current-password"
              onChange={(e) => {
                setPassword(e.target.value);
                clearErrors();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleLogin();
              }}
            />
          </div>

          <button
            className={`login-button ${success ? "login-button-success" : ""}`}
            onClick={handleLogin}
            disabled={loading || success}
            type="button"
          >
            {loading ? "..." : success ? "Autenticado" : "LOGIN"}
          </button>

          {authError && (
            <div className="login-error-zone">
              <div
                className="login-error-message"
                role="alert"
                aria-live="assertive"
              >
                USUARIO O CONTRASEÑA INVALIDOS
              </div>
              <span className="login-forgot">olvidaste tu contraseña</span>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}