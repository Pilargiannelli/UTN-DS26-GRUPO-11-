# ⚙️ Configuración y Cierre Técnico JWT

## 1. Variables de Entorno y Configuración (Backend)
Se actualizó el archivo `backend/.env.example` dejando documentados los parámetros necesarios para la autenticación:
- **`JWT_SECRET`**: Se estableció el placeholder `JWT_SECRET=cambiame` para definir la clave secreta de firma de tokens.
- **`JWT_EXPIRES_IN`**: Se especificó el tiempo de vida útil del token (por ejemplo, `1d` o `2h`).

## 2. Manejo de Expiración y Respuesta 401
1. **Backend**: Ante una solicitud con un token expirado o inválido, el backend responde con un código de estado HTTP **`401 Unauthorized`**.
2. **Frontend Interceptor (`apiFetch`)**:
   - En `frontend/src/services/api.ts`, al recibir un estado `401`:
     - Se invoca la función `borrarToken()` del módulo de sesión para limpiar las credenciales.
     - Se dispara el evento global `"sesion-expirada"`.
     - Se redirige automáticamente al usuario a `/login?expired=true` para forzar un nuevo inicio de sesión de forma limpia e intuitiva.