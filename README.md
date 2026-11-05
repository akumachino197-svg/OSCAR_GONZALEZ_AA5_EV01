# Servicio web de registro e inicio de sesion

**Evidencia:** GA7-220501096-AA5-EV01 — Diseño y desarrollo de servicios web
**Aprendiz:** Óscar Fabián González Cuasapud
**Proyecto:** API REST independiente para registro y autenticación de usuarios

## Introduccion

Este proyecto implementa una API REST para crear usuarios y autenticar sus credenciales. Utiliza Node.js y Express para exponer los endpoints, MySQL para persistir la información y bcrypt para proteger las contraseñas mediante hash. Es una solución nueva, separada del sistema Java de gestión de empleados.

## Objetivos

### Objetivo general

Diseñar y desarrollar un servicio web REST funcional para el registro y autenticación segura de usuarios.

### Objetivos especificos

- Validar los datos recibidos por la API.
- Evitar registros con correo o nombre de usuario ya existentes.
- Guardar únicamente el hash bcrypt de cada contraseña.
- Autenticar las credenciales y responder con códigos HTTP adecuados.
- Probar las rutas principales sin requerir una conexión real a MySQL en la suite automatizada.

## Descripcion del servicio

La API recibe y responde en formato JSON. La capa de rutas dirige las solicitudes a controladores; el servicio de autenticación concentra la lógica de negocio y realiza consultas parametrizadas mediante el pool de `mysql2`. La configuración de MySQL se obtiene de variables de entorno.

## Tecnologias

- Node.js y JavaScript (CommonJS).
- Express 4 y express-validator.
- MySQL 8 o compatible y mysql2.
- bcrypt, dotenv y cors.
- Jest y Supertest para pruebas automatizadas.

## Arquitectura y estructura

```text
OSCAR_GONZALEZ_AA5_EV01/
├── database/schema.sql
├── evidencias/README_EVIDENCIAS.md
├── src/
│   ├── config/database.js
│   ├── controllers/auth.controller.js
│   ├── errors/HttpError.js
│   ├── middlewares/
│   ├── routes/auth.routes.js
│   ├── services/auth.service.js
│   ├── validators/auth.validator.js
│   ├── app.js
│   └── server.js
├── tests/auth.test.js
├── .env.example
├── .gitignore
├── ENLACE_REPOSITORIO.txt
└── package.json
```

`app.js` compone la aplicación Express; `server.js` configura y verifica la conexión a MySQL antes de escuchar solicitudes. Los controladores no exponen el hash, y el servicio encapsula las consultas y el uso de bcrypt.

## Base de datos

El script `database/schema.sql` crea `auth_service_db` y la tabla `users`. Esta contiene `id` (clave primaria autoincremental), `nombre`, `username`, `email`, `password_hash`, `created_at` y `updated_at`. `username` y `email` tienen restricciones únicas. El script debe ejecutarse por el usuario administrador de MySQL; la aplicación debe conectarse con un usuario de privilegios limitados.

## Endpoints

### `GET /api/health`

Indica que el proceso HTTP está activo. No realiza una comprobación de la base de datos.

Respuesta `200`:

```json
{
  "status": "ok",
  "message": "Servicio web funcionando."
}
```

### `POST /api/auth/register`

Registra un usuario. Campos requeridos:

```json
{
  "nombre": "Carlos Pérez",
  "username": "carlos123",
  "email": "carlos@example.com",
  "password": "ClaveSegura123"
}
```

Respuesta `201`:

```json
{
  "message": "Usuario registrado correctamente.",
  "user": {
    "id": 1,
    "nombre": "Carlos Pérez",
    "username": "carlos123",
    "email": "carlos@example.com"
  }
}
```

### `POST /api/auth/login`

Verifica el correo y la contraseña:

```json
{
  "email": "carlos@example.com",
  "password": "ClaveSegura123"
}
```

Respuesta `200`:

```json
{
  "id": 1,
  "nombre": "Carlos Pérez",
  "username": "carlos123",
  "email": "carlos@example.com",
  "message": "Autenticacion exitosa."
}
```

No se emite token ni sesión: una autenticación correcta se confirma mediante la respuesta satisfactoria.

## Codigos HTTP

- `200`: comprobación o autenticación exitosa.
- `201`: usuario creado.
- `400`: datos ausentes o inválidos; se entrega el detalle por campo.
- `401`: credenciales inválidas, con un mensaje igual para usuario inexistente o contraseña incorrecta.
- `404`: ruta no encontrada.
- `409`: correo o nombre de usuario duplicado.
- `500`: error interno; la respuesta no expone detalles de infraestructura.

## Instalacion y ejecucion

Requisitos: Node.js 18 o superior, npm y MySQL 8 o compatible.

1. Abra una terminal en la carpeta `OSCAR_GONZALEZ_AA5_EV01`.
2. Instale dependencias:

   ```powershell
   npm install
   ```

3. Cree la base de datos y la tabla desde MySQL:

   ```powershell
   cmd.exe /c "mysql -u root -p < database\schema.sql"
   ```

4. Cree el usuario de aplicación con permisos limitados sobre `auth_service_db`. No use la cuenta `root` en la aplicación.
5. Copie `.env.example` como `.env` y configure host, puerto, usuario, contraseña, nombre de base de datos y origen CORS. `.env` no se debe compartir ni agregar a Git.
6. Inicie el servicio:

   ```powershell
   npm start
   ```

   El servidor valida una conexión a MySQL antes de comenzar a escuchar en `http://localhost:3000`.

## Configuracion de entorno

| Variable | Descripcion |
|---|---|
| `PORT` | Puerto HTTP; por defecto `3000`. |
| `NODE_ENV` | Entorno de ejecución. |
| `CORS_ORIGIN` | Origen autorizado por CORS. Configure el origen real de su cliente. |
| `DB_HOST`, `DB_PORT` | Host y puerto de MySQL. |
| `DB_USER`, `DB_PASSWORD` | Credenciales del usuario limitado de la aplicación. |
| `DB_NAME` | Base de datos; `auth_service_db`. |
| `BCRYPT_ROUNDS` | Factor de trabajo de bcrypt; por defecto `12`. |

## Pruebas

Ejecute:

```powershell
npm test
```

La suite contiene pruebas para registro, validaciones, duplicados, inicio exitoso e incorrecto, usuario inexistente y error de base de datos. Utiliza un pool simulado y bcrypt real; no sustituye una prueba de integración contra MySQL. La ejecución y sus resultados deben verificarse en el entorno local.

En la verificación de esta entrega, `npm test` ejecutó 12 pruebas y todas pasaron. No se encontró una instalación o servicio local de MySQL, por lo que el script SQL no pudo aplicarse ni se pudo verificar persistencia contra un servidor real. La suite automatizada es independiente de MySQL.

## Medidas de seguridad implementadas

- Hash bcrypt antes de persistir contraseñas; nunca se almacena el texto original.
- Consultas SQL parametrizadas con `pool.execute`.
- Validación de campos y formato de correo; las contraseñas requieren al menos 8 caracteres y no pueden superar 72 bytes UTF-8, límite de bcrypt.
- Respuesta genérica para correo inexistente y contraseña errónea.
- Respuestas de registro e inicio de sesión omiten el hash.
- Variables de entorno y `.gitignore` para excluir `.env`.
- Origen CORS configurable y límite de tamaño JSON.
- Manejo centralizado de errores; los detalles del error no se devuelven al cliente.
- Restricciones únicas en base de datos para manejar duplicados concurrentes.
- Respuestas controladas para JSON malformado y cuerpos que superen el límite configurado.

Esta entrega no implementa JWT, recuperación de contraseñas, bloqueo por intentos ni limitación de solicitudes; no debe considerarse un sistema de autenticación listo para producción sin controles adicionales, TLS y revisión operativa.

## Control de versiones y publicación

Para inicializar Git en esta carpeta nueva:

```powershell
git init
git add .
git commit -m "Crear API REST de registro e inicio de sesion"
```

El repositorio público de esta evidencia es:

https://github.com/akumachino197-svg/OSCAR_GONZALEZ_AA5_EV01

Para publicar futuras modificaciones:

```powershell
git add .
git commit -m "Describir el cambio"
git push -u origin main
```

## Conclusiones

La solución separa las responsabilidades HTTP, validación, lógica de autenticación y persistencia. El código y las pruebas cubren los flujos funcionales requeridos; para demostrar persistencia real deben configurarse MySQL y las variables de entorno y ejecutar las verificaciones descritas en `evidencias/README_EVIDENCIAS.md`.
