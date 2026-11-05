# Guia para las evidencias de desarrollo

Las capturas deben obtenerse en el equipo durante la ejecucion real. No se incluyen imagenes simuladas ni resultados que no hayan sido observados.

Guarde las capturas numeradas en esta carpeta y evite mostrar contrasenas, tokens o valores privados.

1. **Proyecto independiente:** Explorador de VS Code mostrando la carpeta `OSCAR_GONZALEZ_AA5_EV01` fuera de la carpeta del proyecto Java.
2. **Estructura:** Arbol de `src`, `database`, `tests` y `evidencias`.
3. **Dependencias:** Terminal mostrando la ejecucion de `npm install` finalizada.
4. **MySQL configurado:** Terminal de MySQL ejecutando `database/schema.sql` y mostrando la base `auth_service_db`.
5. **Tabla de usuarios:** Resultado de `DESCRIBE users` y de una consulta de columnas sin exponer datos de personas.
6. **Registro:** Editor mostrando `src/services/auth.service.js` y la ruta POST `/api/auth/register`.
7. **Inicio de sesion:** Editor mostrando la ruta POST `/api/auth/login` y la comparacion bcrypt.
8. **Servidor:** Terminal mostrando `npm start` y el mensaje de API disponible.
9. **Registro exitoso:** Cliente HTTP con respuesta 201 y datos ficticios; no incluya la contrasena.
10. **Inicio exitoso:** Cliente HTTP con respuesta 200 y mensaje de autenticacion exitosa.
11. **Credenciales incorrectas:** Cliente HTTP mostrando respuesta 401 y mensaje generico.
12. **Pruebas automatizadas:** Terminal mostrando el resultado real de `npm test`.

Las pruebas automatizadas usan un pool MySQL simulado para no requerir una instancia local. La evidencia de base de datos y la ejecucion manual de solicitudes requiere que el usuario configure y ejecute MySQL.
