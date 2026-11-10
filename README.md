# UTN-DS26-GRUPO-11-

Tema/Dominio: Sistema de Gestión de Turnos y Pacientes 

Cliente: Clinica IMOS Saladillo (Traumatología)

Descripción: Aplicación web para que el médico gestione pacientes, turnos y agenda.
Incluye IA que se comunica por WhatsApp para confirmar turnos, validar pagos y enviar recordatorios.
Solo agenda turnos confirmados y pagos, reduciendo ausencias y desorden.

Miembros del equipo: 

- Nombre: Giannelli Pilar
- Legajo: 33407
- Alias de slack: Pilargiannelli
- Página del perfil público: https://github.com/Pilargiannelli

-  Nombre: Román Augusto
-  Legajo: 33286
-  Alias de slack: augustoromanriver2005-afk
-  Pagina del perfil publico: https://github.com/augustoromanriver2005-afk

-  Nombre: Rodrigo Figueroa
-  Legajo: 31839
-  Alias de slack: Rodrigo Figueroa
-  Pagina del perfil publico: https://github.com/Rodrigo-if

-  Nombre: Tomas Terruli
-  Legajo: 33368
-  Alias de slack: TomasTerruli
-  Pagina del perfil publico: https://github.com/TomasTerruli

- Nombre: Martina Castellani
- Legajo: 33691
- Alias de slack: marticaste144
- Página del perfil público: https://github.com/Marticaste144

- Nombre: Ezequiel Basoalto
- Legajo: 33268
- Alias de slack: chinoBasoalto
- Pagina del perfil: https://github.com/chinoBasoalto


---

## Cómo levantar el proyecto (Docker)

Requisitos: Docker Desktop.

### 1. Variables de entorno

```bash
cp backend/.env.example backend/.env
```

Editar `backend/.env` y poner una `POSTGRES_PASSWORD` propia. **Importante:** también hay que
repetirla dentro de `DATABASE_URL`, porque Docker Compose no expande variables dentro de un
`env_file`. El archivo `backend/.env` está en `.gitignore` y nunca se commitea.

### 2. Levantar los contenedores

```bash
docker compose up -d --build
```

Esto arranca tres servicios:

| Servicio | Contenedor | Puerto | Descripción |
|---|---|---|---|
| `db` | `imos-db` | 5432 | PostgreSQL 16 con volumen persistente `pgdata` |
| `api` | `imos-api` | 3000 / 5555 | API Express + Prisma Studio |
| `frontend` | `imos-frontend` | 5173 | Frontend (Vite) en http://localhost:5173 |

El contenedor del frontend copia el código al construirse (no lo monta como volumen): después
de un `git pull` o de cambiar de rama hay que volver a correr `docker compose up -d --build`.

La API espera automáticamente a que Postgres esté listo (`healthcheck` con `pg_isready` +
`depends_on: condition: service_healthy`), así que no hace falta reintentar.

Verificar que la base quedó sana:

```bash
docker compose ps          # db debe figurar como "Up (healthy)"
```

### 3. Comandos de Prisma

Se ejecutan **dentro** del contenedor, porque ahí `DATABASE_URL` apunta al host `db`:

```bash
docker compose exec api npx prisma migrate dev --name init   # crear/aplicar migración
docker compose exec api npm run db:seed                      # cargar datos de prueba
docker compose exec api npm run db:studio                    # Prisma Studio en http://localhost:5555
docker compose exec api npx prisma generate                  # regenerar el cliente
```

Las carpetas `backend/prisma/` y el archivo `backend/prisma.config.ts` están montados como
volúmenes, así que las migraciones generadas dentro del contenedor aparecen en tu máquina y se
pueden commitear.

### 4. Otros comandos útiles

```bash
docker compose logs -f api    # ver logs de la API
docker compose down           # bajar todo (conserva los datos)
docker compose down -v        # bajar todo y BORRAR la base
```

---

## Deploy

La aplicación está desplegada en **Render** (backend y frontend) con la base de datos en **Neon**.

| Servicio | Plataforma | URL |
|---|---|---|
| Frontend | Render · Static Site | https://imos-frontend.onrender.com |
| Backend (API) | Render · Web Service (Docker) | https://imos-api-entd.onrender.com |
| Base de datos | Neon · PostgreSQL (AWS us-east-1) | privada |

> En el plan gratuito el backend se "duerme" sin tráfico: la primera petición puede tardar cerca de un minuto.

### Servicios y configuración

- **Neon:** proyecto PostgreSQL en la región AWS us-east-1. Se usa la conexión **directa** (no la "pooled").
- **Backend (Web Service):** Docker, *Root Directory* `backend`, *Dockerfile Path* `Dockerfile.prod`, rama `main`.
  Al arrancar, la imagen corre `prisma migrate deploy` y luego `node dist/index.js`.
- **Frontend (Static Site):** *Root Directory* `frontend`, *Build Command* `npm run build`, *Publish Directory* `dist`.
  Regla de *Rewrite* `/*` → `/index.html` (sin ella, refrescar una ruta interna da 404).

### Variables de entorno (sin valores)

Se cargan en el panel de cada servicio de Render; no hay `.env` de producción en el repositorio.

| Servicio | Variable | Qué es |
|---|---|---|
| Backend | `DATABASE_URL` | Conexión directa a Neon (`...?sslmode=require`) |
| Backend | `JWT_SECRET` | Clave para firmar tokens (generada por Render) |
| Backend | `FRONTEND_URL` | URL exacta del frontend, sin `/` final (la usa CORS) |
| Backend | `JWT_EXPIRES_IN`, `SALT_ROUNDS` | Opcionales: tienen valor por defecto |
| Backend | `PORT` | La inyecta Render |
| Frontend | `VITE_API_URL` | URL del backend terminada en `/api`. Se embebe en el build: si cambia, hay que redeployar |

Las variables de desarrollo están documentadas en `backend/.env.example` y `frontend/.env.example`.

### Migraciones y carga de datos

- **Migraciones:** las aplica el backend solo, al arrancar (`prisma migrate deploy`), a partir de lo commiteado en `backend/prisma/migrations/`. Si una migración falla, el deploy falla y sigue corriendo la versión anterior.
- **Datos iniciales (seed):** se cargan una vez desde una PC con Docker, apuntando a Neon:

```bash
docker compose run --rm -e DATABASE_URL="<URL directa de Neon>" api npx prisma db seed
```

### Deploy automático

Cada push a `main` redeploya los servicios afectados (cambiar una variable de entorno también redeploya). Los usuarios de prueba se entregan por el canal del grupo, no en el repositorio.

---

## Estado actual del proyecto

### Stack técnico

- **Backend:** Node.js + Express + TypeScript, Prisma ORM sobre PostgreSQL.
- **Frontend:** React + TypeScript (Vite).
- **Infraestructura:** Docker Compose para desarrollo (contenedores `db` con Postgres 16, `api` con la API Express y `frontend` con Vite), con healthcheck para que la API espere a que la base esté lista. En producción, Render + Neon (ver [Deploy](#deploy)).
- **Documentación:** carpeta `Documentacion/` con Visión y Alcance, Análisis inicial, Modelado de Dominio, Backlog, UX/UI, Diseño de API y Seguridad.

### Qué está funcionando

- **Autenticación y cuenta:** login contra la API con JWT, sesión que se recupera al recargar (`GET /api/auth/yo`), "Crear cuenta" para pacientes, Mi cuenta (datos y cambio de contraseña) y cierre de sesión automático si el token vence.
- **Autorización por rol:** cada endpoint valida el rol con `authorize` y la titularidad en el service (un recurso ajeno responde 404). En el front, `PrivateRoute` protege las rutas y cada rol ve su propio menú. Detalle en [Matriz de permisos](Documentacion/06%20-%20Seguridad/matriz-permisos.md).
- **Turnos:** el paciente pide turno eligiendo especialidad, médico y horario libre, ve sus próximos turnos y su historial, y cancela los que todavía no fueron confirmados. La secretaria y el médico crean, confirman y cancelan turnos. La API impide turnos en el pasado, fuera de lunes a viernes, fuera de los horarios de 30 minutos y dos turnos del mismo médico a la misma hora.
- **Agenda:** vista diaria y semanal; el médico ve la suya y la secretaria elige el médico.
- **Pacientes y médicos:** la secretaria da de alta pacientes y médicos y edita sus datos y obra social. El paciente y el médico que da de alta la secretaria entran con su **email** y su **DNI como contraseña inicial**; quien se registra con "Crear cuenta" elige su contraseña.
- **Historia clínica:** el médico registra consultas (diagnóstico, evolución e indicaciones) y edita alergias y antecedentes desde la ficha del paciente. Las consultas no se editan ni se borran (Ley 26.529). El paciente ve lo que le indicó el médico junto a cada turno; la secretaria no tiene acceso.
- **API REST:** todos los endpoints, con sus permisos y errores, en [Diseño de API](Documentacion/05%20-%20Diseño%20de%20API/diseño-api.md). Ejemplos para probarlos en `backend/api.http`.
- **Deploy:** front y back en Render, base en Neon, con deploy automático en cada push a `main` (ver [Deploy](#deploy)).
- **Tests:** Vitest en backend y frontend (ver [Testing](#testing)).

### Pendiente

- Asistente de WhatsApp (IA) para confirmación de turnos, validación de pagos y recordatorios: no implementado. El modelo de datos ya lo contempla.
- Configurar la disponibilidad de cada médico (días, horarios y bloqueos por vacaciones o licencias). Hoy todos atienden de lunes a viernes, con turnos cada 30 minutos.
- Pantalla para reprogramar un turno: la API lo permite (`PUT /api/turnos/:id`), pero la interfaz todavía no.
- Integración continua (CI) para correr tests y lint en cada push antes del deploy.
- Guardar el token en una cookie `httpOnly` en lugar de `localStorage`.

---

## Testing

El proyecto cuenta con una suite de pruebas automatizadas con **Vitest** y **Supertest**.

### Estructura de pruebas
- **Pruebas de Integración con Base de Datos (`*.db.test.ts`)**: Prueban los flujos completos contra PostgreSQL (autenticación con login/sesión y consulta real de turnos desde el `seed`).
- **Pruebas de Matriz y Unitarias (`*.test.ts`)**: Prueban validaciones (Zod), middlewares y rechazos de permisos (401, 403, 400) aislando la base de datos con mocks.

### Cómo ejecutar los tests (Docker)

Asegúrate de tener la base de datos levantada y sembrada antes de ejecutar las pruebas de integración:

```bash
# 1. Aplicar migraciones y sembrar la base de datos (si no se realizó previamente)
docker compose exec api npm run db:migrate
docker compose exec api npm run db:seed

# 2. Ejecutar únicamente las pruebas de integración con Base de Datos (en el contenedor)
docker compose run --rm api npm run test:db

# 3. Ejecutar la suite completa de pruebas unitarias y de matriz
docker compose run --rm api npm run test
```

### Tests unitarios del backend (sin base de datos)

Los `*.test.ts` (sin `.db`) corren sin Docker ni base de datos: Prisma se reemplaza con `vi.mock`. Cubren los schemas Zod, los middlewares (`authenticate`, `authorize`, `validate`, `errorHandler`), los controllers (que solo delegan en el service y pasan los errores a `next`) y los services (reglas de negocio y titularidad: turnos, pacientes, historia clínica, auth).

```bash
cd backend
npm install
npm test
```

### Tests del frontend

Corren en el host, sin Docker, con **Vitest + Testing Library** (entorno `jsdom`). Cubren utilidades (`fecha`, `horarios`, `periodos`), schemas Zod, hooks, el `AuthProvider`, componentes y páginas (por ejemplo, el menú y el inicio según el rol).

```bash
cd frontend
npm install
npm test
```
