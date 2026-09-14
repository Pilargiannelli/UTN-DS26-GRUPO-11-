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

Esto arranca dos servicios:

| Servicio | Contenedor | Puerto | Descripción |
|---|---|---|---|
| `db` | `imos-db` | 5432 | PostgreSQL 16 con volumen persistente `pgdata` |
| `api` | `imos-api` | 3000 / 5555 | API Express + Prisma Studio |

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

## Estado actual del proyecto

### Stack técnico

- **Backend:** Node.js + Express + TypeScript, Prisma ORM sobre PostgreSQL.
- **Frontend:** React + TypeScript (Vite).
- **Infraestructura:** Docker Compose (contenedores `db` con Postgres 16 y `api` con la API Express), con healthcheck para que la API espere a que la base esté lista.
- **Documentación:** carpeta `Documentacion/` con Visión y Alcance, Análisis inicial, Modelado de Dominio, Backlog, UX/UI, Diseño de API y Seguridad.

### Qué está funcionando

- **Autenticación:** login real contra la API con `AuthContext` y manejo de token en el frontend.
- **API REST:** endpoints montados en `/api/auth`, `/api/turnos`, `/api/obras-sociales`, `/api/especialidades` y `/api/usuarios` (incluye `/medicos` y `/pacientes`), con control de permisos por rol (paciente, médico, secretaria/admin).
- **Turnos contra la API real:** se reemplazaron los mocks en JSON por llamadas reales a la API para pedir, listar y cancelar turnos.
- **Gestión de usuarios:** registro de pacientes y médicos, listado y edición de usuarios, con formularios validados (Zod/schemas por tipo de usuario).
- **Modelo de datos:** definido en Prisma (Usuario, Paciente, Médico, Secretaria, Turno, Agenda, HistoriaClínica, ObraSocial, Especialidad, entre otros), con migraciones y seed de datos de prueba.
- **Entorno reproducible:** `docker compose up` levanta base de datos y API con un solo comando; variables de entorno separadas por `.env.example` en backend y frontend.

### En qué estamos trabajando / pendiente

- Terminar de pulir pantallas conectadas a la API real (se vienen corrigiendo bugs de datos y estilos a medida que se integra cada vista: Home, HomePaciente, PedirTurno, etc.).
- Completar el circuito de historia clínica y agenda semanal del médico.
- Integrar el asistente de WhatsApp (IA) para confirmación de turnos, validación de pagos y recordatorios — todavía no implementado, es la funcionalidad diferencial del proyecto.
- Reforzar validaciones y matriz de permisos por rol en endpoints nuevos.
- Sumar tests automatizados (actualmente la verificación es manual vía `api.http` y prueba en la UI).
