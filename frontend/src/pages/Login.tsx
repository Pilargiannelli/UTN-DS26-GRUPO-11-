import { useState } from "react";

const USERS = [
  { u: "medico1",   p: "med123",  rol: "medico" },
  { u: "admin1",    p: "adm123",  rol: "admin" },
  { u: "paciente1", p: "pac123",  rol: "paciente" },
];

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);
  const [fieldErr, setFieldErr]   = useState({ u: false, p: false });
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

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
        // TODO: descomentar cuando se integre react-router
        // navigate(`/${found.rol}`);
        setTimeout(() => setSuccess(false), 2000);
      } else {
        setAuthError(true);
        setPassword("");
      }
    }, 400);
  };

  return (
    <div style={s.page}>
      <div style={s.wrap}>

        {/* ── IZQUIERDA: verde oscuro + logo celeste ── */}
        <div style={s.left}>
          <div style={s.circle}>
            <svg
              width="52"
              height="52"
              viewBox="0 0 48 48"
              fill="none"
              stroke="#93DFDB"
              strokeWidth="1.8"
              aria-hidden="true"
            >
              <rect x="20" y="8"  width="8"  height="32" rx="3" />
              <rect x="8"  y="20" width="32" height="8"  rx="3" />
              <circle cx="24" cy="24" r="21" />
            </svg>
          </div>
          <div style={s.brandName}>IMOS</div>
          <div style={s.brandTag}>Sistema Hospitalario</div>
        </div>

        {/* ── DERECHA: formulario blanco ── */}
        <div style={s.right}>
          <h1 style={s.title}>Login</h1>
          <p  style={s.sub}>Ingresá tus credenciales para continuar</p>

          {/* Campo usuario */}
          <div style={s.field}>
            <label style={s.label} htmlFor="inp-user">
              Email / Nombre de usuario
            </label>
            <input
              id="inp-user"
              type="text"
              value={username}
              placeholder="email / nombre usuario"
              autoComplete="username"
              style={{
                ...s.input,
                ...(fieldErr.u || authError ? s.inputErr : {}),
              }}
              onChange={(e) => { setUsername(e.target.value); clearErrors(); }}
              onKeyDown={(e) => {
                if (e.key === "Enter")
                  document.getElementById("inp-pass")?.focus();
              }}
            />
          </div>

          {/* Campo contraseña */}
          <div style={s.field}>
            <label style={s.label} htmlFor="inp-pass">
              Contraseña
            </label>
            <input
              id="inp-pass"
              type="password"
              value={password}
              placeholder="contraseña"
              autoComplete="current-password"
              style={{
                ...s.input,
                ...(fieldErr.p || authError ? s.inputErr : {}),
              }}
              onChange={(e) => { setPassword(e.target.value); clearErrors(); }}
              onKeyDown={(e) => { if (e.key === "Enter") handleLogin(); }}
            />
          </div>

          {/* Botón LOGIN */}
          <button
            onClick={handleLogin}
            disabled={loading || success}
            style={{ ...s.btn, ...(success ? s.btnSuccess : {}) }}
            type="button"
          >
            {loading ? "..." : success ? "✓ Autenticado" : "LOGIN"}
          </button>

          {/* Error debajo del botón — criterio de aceptación 2 */}
          {authError && (
            <div style={s.errZone}>
              <div style={s.errMsg} role="alert" aria-live="assertive">
                USUARIO O CONTRASEÑA INVALIDOS
              </div>
              {/* Link secundario — solo visual, fuera del alcance */}
              <span style={s.forgot}>olvidaste tu contraseña</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f0f0f0",
    padding: "2rem 1rem",
    fontFamily: "'Inter', sans-serif",
  },
  wrap: {
    display: "flex",
    width: "100%",
    maxWidth: 820,
    minHeight: 520,
    borderRadius: 16,
    overflow: "hidden",
    boxShadow: "0 4px 32px rgba(21,51,16,0.22)",
    background: "#fff",
  },
  left: {
    position: "relative",
    width: "50%",
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 4rem 2rem 2rem",
    background: "linear-gradient(150deg, #1E4B05 0%, #153310 100%)",
    clipPath: `polygon(
      0% 0%, 78% 0%, 80% 1%, 82% 2%, 84% 4%, 86% 6%, 88% 9%, 90% 12%,
      91% 15%, 92% 18%, 93% 22%, 94% 26%, 95% 30%, 95.5% 34%,
      96% 38%, 96% 42%, 96% 46%, 96% 50%, 96% 54%, 96% 58%,
      95.5% 62%, 95% 66%, 94% 70%, 93% 74%, 92% 78%, 91% 81%,
      90% 84%, 88% 87%, 86% 90%, 84% 92%, 82% 94%, 80% 96%,
      78% 98%, 76% 99%, 74% 100%, 0% 100%
    )`,
  },
  circle: {
    width: 108,
    height: 108,
    borderRadius: "50%",
    background: "rgba(38,160,160,0.12)",
    border: "2.5px solid #26A0A0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "1.4rem",
  },
  brandName: {
    fontSize: 28,
    fontWeight: 800,
    color: "#93DFDB",
    letterSpacing: 4,
  },
  brandTag: {
    fontSize: 10,
    color: "rgba(147,223,219,0.65)",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginTop: 6,
  },
  right: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "2.5rem 2rem 2.5rem 3rem",
    background: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    color: "#1a2e1a",
    marginBottom: 4,
    width: "100%",
  },
  sub: {
    fontSize: 13,
    color: "#5a7a5a",
    marginBottom: "1.75rem",
    width: "100%",
  },
  field: {
    width: "100%",
    marginBottom: 13,
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#5a7a5a",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 5,
  },
  input: {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #d0d8d0",
    borderRadius: 8,
    fontSize: 14,
    color: "#1a2e1a",
    fontFamily: "'Inter', sans-serif",
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  inputErr: {
    borderColor: "#e57373",
  },
  btn: {
    width: "100%",
    padding: 13,
    background: "linear-gradient(135deg, #1E4B05 0%, #153310 100%)",
    border: "none",
    borderRadius: 8,
    fontSize: 14,
    fontWeight: 700,
    color: "#fff",
    cursor: "pointer",
    letterSpacing: 1,
    fontFamily: "'Inter', sans-serif",
    marginTop: 4,
  },
  btnSuccess: {
    background: "#2e7d32",
  },
  errZone: {
    width: "100%",
    marginTop: 12,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
  },
  errMsg: {
    width: "100%",
    background: "#fdecea",
    border: "1.5px solid #e57373",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 12,
    color: "#c62828",
    textAlign: "center",
    fontWeight: 600,
  },
  forgot: {
    fontSize: 12,
    color: "#26A0A0",
    textDecoration: "underline",
    cursor: "default",
  },
};