# Tura Limpia

Sistema web para la gestión de rutas de recolección de residuos en **Buenaventura**: vehículos, conductores, rutas con trazado en mapa y programación del servicio.

Universidad del Pacífico · Ingeniería de Sistemas · Seminario de Actualización I

---

## Datos de la entrega

| | |
|---|---|
| **Equipo** | _[Nombre del equipo]_ |
| **Repositorio** | _[https://github.com/ORGANIZACION/REPOSITORIO]_ |
| **Release semana-1** | _[https://github.com/ORGANIZACION/REPOSITORIO/releases/tag/semana-1]_ |
| **Evidencia** | [docs/evidencia](docs/evidencia) · ver también [Evidencia de funcionamiento](#evidencia-de-funcionamiento) |
| **Frontend público** | _(opcional en la entrega 1)_ |
| **Backend público** | _(opcional en la entrega 1)_ |

## Integrantes y responsabilidades

Cada tarea está a cargo de una pareja. Dentro de la pareja, cada integrante sube su propio bloque desde su cuenta (rama y pull request propios) y revisa el pull request de su compañero.

| Tarea | Integrante | Usuario GitHub | Bloque a cargo | Responsabilidades en la entrega 1 |
|---|---|---|---|---|
| **1. Base de datos y administración del repositorio** | _[Nombre]_ | @JhonPava | 1 · Base de datos | Conexión a PostgreSQL, migraciones, datos de prueba y script del administrador inicial. Revisión y merge de PRs, release `semana-1` |
| **2. Backend: servidor y autenticación** | _[Nombre]_ | _[@usuario]_ | 2 · Servidor | Servidor Express, CORS, manejo de errores y endpoint de salud (`/api/health`) |
| | _[Nombre]_ | _[@usuario]_ | 3 · Autenticación | Generación y validación del token, sesiones, permisos de administrador |
| **3. Backend: endpoints y pruebas** | _[Nombre]_ | _[@usuario]_ | 4 · Endpoints | Controladores y rutas de login, logout, perfil y dashboard |
| | _[Nombre]_ | _[@usuario]_ | 5 · Pruebas | Pruebas automáticas del acceso administrativo |
| **4. Frontend: base e inicio de sesión** | _[Nombre]_ | _[@usuario]_ | 6 · Frontend base | Proyecto React + Vite, cliente de la API, estilos |
| | _[Nombre]_ | _[@usuario]_ | 7 · Login | Pantalla de inicio de sesión, mensajes de error y manejo de la sesión |
| **5. Frontend: dashboard y evidencia** | _[Nombre]_ | _[@usuario]_ | 8 · Dashboard | Dashboard, rutas protegidas, cierre de sesión y accesos a los módulos |
| | _[Nombre]_ | _[@usuario]_ | 9 · Documentación | README, instrucciones de verificación y capturas del funcionamiento |

## Tecnologías

Backend propio e independiente con PostgreSQL. No se usan servicios tipo backend-as-a-service (Supabase, Firebase, Atlas): los endpoints, controladores y migraciones están en este repositorio.

| Capa | Tecnología |
|---|---|
| Base de datos | PostgreSQL 16 |
| Backend | Node.js 20+, Express 5, Knex (migraciones y seeds), JWT, bcrypt, Zod |
| Frontend | React 19, Vite, React Router |
| Pruebas | `node:test` + Supertest (API) |
| Organización | GitHub: ramas por funcionalidad, pull requests y releases semanales |

## Estructura del repositorio

```
tura-limpia/
├── backend/
│   ├── db/migrations/      # Migraciones: crean la BD desde cero
│   ├── db/seeds/           # Datos mínimos de prueba
│   ├── scripts/            # create-admin.js (administrador inicial)
│   ├── src/                # API: rutas, middleware, servicios
│   ├── tests/              # Pruebas de los endpoints
│   └── knexfile.js
├── frontend/
│   └── src/                # React: login, dashboard, rutas protegidas
├── docs/evidencia/         # Capturas del funcionamiento
└── docker-compose.yml      # PostgreSQL local (opcional)
```

---

## Cómo ejecutar el proyecto

**Requisitos:** Node.js 20 o superior y PostgreSQL 14 o superior (instalado o con Docker).

### 1. Base de datos

Con Docker:

```bash
docker compose up -d
```

O con PostgreSQL instalado, crea la base de datos:

```sql
CREATE DATABASE tura_limpia;
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # en Windows: copy .env.example .env
npm run db:migrate          # crea las tablas desde cero
npm run db:seed             # carga los usuarios de prueba (incluye el administrador)
npm run dev                 # http://localhost:4000
```

Comprueba que responde: <http://localhost:4000/api/health> debe devolver `"estado": "ok"` y `"baseDatos": "conectada"`.

### 3. Frontend

En otra terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev                 # http://localhost:5173
```

### Crear el administrador inicial

El seed ya crea el administrador con los datos `ADMIN_*` del `.env`. Para crearlo o restablecer su contraseña por separado (por ejemplo, en el servidor de producción):

```bash
cd backend
npm run create-admin
# o con datos propios:
npm run create-admin -- --email jefe@turalimpia.co --password "ClaveSegura123" --nombre "Jefe de operaciones"
```

Si el correo ya existe, el script actualiza su contraseña y lo deja como administrador activo.

### Reconstruir la base de datos desde cero

```bash
cd backend
npm run db:reset    # borra todas las tablas, vuelve a migrar y carga los datos de prueba
```

### Pruebas automáticas

```bash
cd backend
npm test
```

Cubren: health check, login correcto, credenciales incorrectas, validación de campos, usuario desactivado, acceso sin token, token alterado, usuario sin rol de administrador, acceso al dashboard y cierre de sesión.

---

## Usuarios de prueba

Los crea `npm run db:seed`:

| Correo | Contraseña | Rol | Para qué sirve |
|---|---|---|---|
| `admin@turalimpia.co` | `Admin123*` | ADMIN | Entrar al panel |
| `operador@turalimpia.co` | `Operador123*` | OPERADOR | Comprobar que alguien sin rol de administrador **no** entra |
| `inactivo@turalimpia.co` | `Inactivo123*` | ADMIN (inactivo) | Comprobar el mensaje de cuenta desactivada |

> Estas credenciales son solo para desarrollo local. Las del entorno público se envían por Teams.

---

## Instrucciones para verificar el acceso administrativo

Con backend y frontend corriendo y los datos de prueba cargados:

| # | Paso | Resultado esperado |
|---|---|---|
| 1 | Abrir <http://localhost:5173/dashboard> sin haber iniciado sesión | Redirige a `/login` |
| 2 | Ingresar `admin@turalimpia.co` con una contraseña equivocada | Mensaje: **"Correo o contraseña incorrectos."** |
| 3 | Dejar los campos vacíos y pulsar *Ingresar* | Mensaje: **"Ingresa tu correo y tu contraseña."** |
| 4 | Ingresar con `operador@turalimpia.co` / `Operador123*` | Mensaje: **"Esta cuenta no tiene permisos de administrador."** |
| 5 | Ingresar con `inactivo@turalimpia.co` / `Inactivo123*` | Mensaje: **"Tu cuenta está desactivada. Contacta al administrador."** |
| 6 | Ingresar con `admin@turalimpia.co` / `Admin123*` | Abre el dashboard con accesos a **Vehículos, Conductores, Rutas y Programación** |
| 7 | Recargar la página | La sesión se mantiene |
| 8 | Pulsar *Cerrar sesión* | Vuelve al login con "Cerraste sesión correctamente." |
| 9 | Intentar abrir `/dashboard` otra vez | Redirige a `/login` |

### Verificación directa en el backend (opcional)

```bash
# Sin token -> 401 "Debes iniciar sesión para continuar."
curl -i http://localhost:4000/api/dashboard

# Login -> devuelve { token, expiraEn, usuario }
curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@turalimpia.co","password":"Admin123*"}'

# Con el token -> 200 y la lista de módulos
curl -s http://localhost:4000/api/dashboard -H "Authorization: Bearer TOKEN_AQUI"

# Cerrar sesión -> después, el mismo token responde 401
curl -s -X POST http://localhost:4000/api/auth/logout -H "Authorization: Bearer TOKEN_AQUI"
```

---

## Cómo funciona la sesión

1. `POST /api/auth/login` comprueba la contraseña con **bcrypt**. Si es correcta, crea una fila en la tabla `sesiones` y devuelve un **JWT** firmado que lleva el id de esa sesión.
2. El frontend guarda el token y lo envía en cada petición: `Authorization: Bearer <token>`.
3. El middleware `requiereAutenticacion` valida la firma y la expiración del token, y además confirma en la base de datos que la sesión sigue abierta y el usuario sigue activo.
4. El middleware `requiereRol('ADMIN')` bloquea con **403** a quien no sea administrador.
5. `POST /api/auth/logout` marca la sesión como cerrada, así que ese token deja de servir aunque no haya expirado.

El frontend también protege las páginas (`RutaProtegida`), pero quien decide de verdad es siempre el backend.

## Endpoints (entrega 1)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/health` | Público | Estado del backend y de la conexión con PostgreSQL |
| POST | `/api/auth/login` | Público | Inicia sesión. Body: `{ email, password }` |
| POST | `/api/auth/logout` | Autenticado | Cierra la sesión actual |
| GET | `/api/auth/me` | Autenticado | Datos del usuario de la sesión |
| GET | `/api/dashboard` | Solo ADMIN | Usuario y módulos del panel |

Los errores tienen siempre el mismo formato: `{ "error": { "codigo": "...", "mensaje": "..." } }`.

## Variables de entorno

**backend/.env**

| Variable | Descripción |
|---|---|
| `DATABASE_URL` | Conexión a PostgreSQL |
| `DATABASE_SSL` | `true` si la base de datos está en la nube |
| `PORT` | Puerto del backend (4000 por defecto) |
| `JWT_SECRET` | Clave para firmar tokens. **En producción, una cadena larga y aleatoria** |
| `JWT_EXPIRES_IN` | Duración de la sesión (ej. `8h`) |
| `CORS_ORIGIN` | URL(s) del frontend permitidas, separadas por coma |
| `ADMIN_NOMBRE`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Datos del administrador inicial |

**frontend/.env**

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL del backend |

Los archivos `.env` **no se suben a GitHub** (están en `.gitignore`). En la nube se configuran en el panel del proveedor.

---

## Evidencia de funcionamiento

Capturas en [`docs/evidencia`](docs/evidencia), tomadas sobre el código del release `semana-1`.

| | |
|---|---|
| **1. Login** ![Login](docs/evidencia/01-login.png) | **2. Credenciales incorrectas** ![Error](docs/evidencia/02-credenciales-incorrectas.png) |
| **3. Usuario sin permisos de administrador** ![Sin permisos](docs/evidencia/03-usuario-sin-permisos.png) | **4. Dashboard del administrador** ![Dashboard](docs/evidencia/04-dashboard.png) |
| **5. Acceso a un módulo** ![Módulo](docs/evidencia/05-modulo-vehiculos.png) | **6. Sesión cerrada** ![Logout](docs/evidencia/06-sesion-cerrada.png) |

---

## Despliegue (obligatorio desde la entrega 3; recomendado desde ya)

Una opción gratuita:

- **Base de datos:** una instancia de PostgreSQL administrada (por ejemplo, Render PostgreSQL o Railway PostgreSQL). Copia su URL en `DATABASE_URL` y pon `DATABASE_SSL=true`.
- **Backend (Render → Web Service):** directorio raíz `backend`, build `npm install && npm run db:migrate`, start `npm start`. Configura las variables de entorno en el panel. Luego, una sola vez, ejecuta `npm run create-admin` desde la *Shell* de Render.
- **Frontend (Vercel):** directorio raíz `frontend`, variable `VITE_API_URL` = URL pública del backend. El archivo `vercel.json` ya hace que las rutas de React funcionen al recargar.
- Agrega la URL de Vercel a `CORS_ORIGIN` en el backend.

## Flujo de trabajo del equipo

Ver [`docs/GUIA-EQUIPO.md`](docs/GUIA-EQUIPO.md): ramas, pull requests y cómo crear el release semanal.
