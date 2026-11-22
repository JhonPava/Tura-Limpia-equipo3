# Base de datos – Tura Limpia

PostgreSQL 16 con migraciones y seeds de **Knex**. El esquema implementa el MER unificado del
sistema de gestión de rutas de recolección y barrido.

## Comandos (desde `backend/`)

| Comando | Qué hace |
|---|---|
| `npm run db:migrate` | Crea las tablas que falten (desde cero si la base está vacía) |
| `npm run db:seed` | Carga catálogos, usuarios de prueba y datos de operación |
| `npm run db:reset` | Borra todas las tablas, vuelve a migrar y carga los seeds (solo desarrollo) |
| `npm run db:status` | Muestra qué migraciones están aplicadas |
| `npm run db:rollback` | Deshace todas las migraciones |
| `npm run create-admin` | Crea o restablece el administrador (ver README principal) |

La conexión se toma de `DATABASE_URL` (y `DATABASE_SSL=true` para bases en la nube) en `backend/.env`.

## Archivos

```
backend/
├── knexfile.js                     Conexión y rutas de migraciones/seeds
├── db/
│   ├── migrations/
│   │   ├── ..._seguridad.js              barrio, usuario, usuario_telefono, rol, perfil, sesiones
│   │   ├── ..._personal.js               trabajador, conductor, cuadrilla, cuadrilla_trabajador, v_cuadrilla
│   │   ├── ..._rutas_y_programacion.js   macroruta, microruta, parada_ruta, dia_semana, turno, vehiculo,
│   │   │                                 programacion_ruta, programacion_dia, asignacion
│   │   ├── ..._operacion.js              ejecucion_ruta, ejecucion_cuadrilla, cumplimiento_parada,
│   │   │                                 ubicacion_gps, novedad
│   │   └── ..._vista_usuario_roles.js    v_usuario_roles (login y permisos)
│   ├── seeds/
│   │   ├── 01_catalogos.js         roles (ADMIN, OPERADOR, CONDUCTOR), días, turnos
│   │   ├── 02_usuarios.js          admin, operador e inactivo (usuarios de prueba del README)
│   │   └── 03_operacion.js         datos para el dashboard (borra y recrea la operación)
│   └── usuarios.js                 guardarUsuario(): lo usan el seed y create-admin
└── scripts/create-admin.js
```

## Datos de prueba

Además de los usuarios del README principal, `03_operacion.js` crea (contraseña `Prueba123*`):

- 2 conductores (`crivas@`, `amosquera@turalimpia.co`) y 3 operarios de barrido.
- 6 barrios de los sectores de prueba de Buenaventura: Centro, Puertos, Playita, Palo Seco, Marina y Oriente.
- 3 vehículos (uno en mantenimiento), 2 cuadrillas.
- 3 macrorutas con su microruta, paradas y días de servicio (lunes a sábado; lunes y jueves; martes y viernes).
- 3 asignaciones (23 y 24 de noviembre de 2026) y un recorrido terminado con GPS, paradas cumplidas y una novedad.

## Uso desde el backend

**Login.** Una sola consulta trae todo lo necesario:

```js
const usuario = await knex('v_usuario_roles')
  .whereRaw('lower(correo) = lower(?)', [email])
  .first();
// usuario: { id_usuario, correo, nombre_usuario, nombre, contrasena_hash, estado, roles: ['ADMIN'] }
// 1. bcrypt.compare(password, usuario.contrasena_hash)   -> si falla: "Correo o contraseña incorrectos."
// 2. usuario.estado !== 'ACTIVO'                          -> "Tu cuenta está desactivada..."
// 3. !usuario.roles.includes('ADMIN')                     -> 403 sin permisos de administrador
```

Las contraseñas están en bcrypt (`bcryptjs`, compatible con el paquete `bcrypt`).

**Sesiones.** Al iniciar sesión se inserta una fila y su `id_sesion` (UUID) va dentro del JWT:

```js
const [sesion] = await knex('sesiones')
  .insert({ id_usuario, expira_en, ip: req.ip, user_agent: req.get('user-agent') })
  .returning('id_sesion');
```

Una sesión es válida si `cerrada_en IS NULL AND expira_en > now()`. El logout hace
`update({ cerrada_en: knex.fn.now() })`.

**Dashboard.** Tablas de cada módulo: `vehiculo`, `conductor` (+ `trabajador`, `perfil`, `usuario`),
`macroruta` / `microruta` / `parada_ruta`, y `programacion_ruta` + `programacion_dia` + `asignacion`.

## Del MER a las tablas

| MER | Implementación |
|---|---|
| `telefono` (multivaluado) | tabla `usuario_telefono` |
| `nombre_completo` (compuesto) | columnas `nombres` y `apellidos` |
| `num_integrantes` (derivado) | vista `v_cuadrilla` |
| `duracion_real` (derivado) | columna generada `fecha_hora_fin - fecha_hora_inicio` |
| `coordenadas` (compuesto) | columnas `latitud` y `longitud` |
| INTEGRA, SE_REPITE, PARTICIPA, CUMPLE (M:N) | `cuadrilla_trabajador`, `programacion_dia`, `ejecucion_cuadrilla`, `cumplimiento_parada` |
| ES, ES_CONDUCTOR, SE_EJECUTA (1:1) | llave foránea con `UNIQUE` |
| ASIGNADO, CONDUCE (0,1) | llave foránea opcional en `asignacion` |
| `estado` | texto con `CHECK` de los valores permitidos (en mayúsculas) |
| — | `sesiones`: no está en el MER; la pide el cierre de sesión con JWT |

Reglas adicionales: el correo es único sin distinguir mayúsculas; un usuario no puede tener dos
perfiles activos con el mismo rol; un vehículo o conductor no puede tener dos asignaciones activas
en la misma fecha y turno.
