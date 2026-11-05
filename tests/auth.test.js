const request = require('supertest');
const bcrypt = require('bcrypt');
const createApp = require('../src/app');
const AuthService = require('../src/services/auth.service');

function createPool(initialUsers = []) {
  const users = [...initialUsers];
  const pool = {
    users,
    execute: jest.fn(async (sql, params) => {
      if (sql.includes('WHERE email = ? OR username = ?')) {
        return [users.filter((user) => user.email === params[0] || user.username === params[1])];
      }
      if (sql.includes('WHERE email = ?')) {
        return [users.filter((user) => user.email === params[0])];
      }
      if (sql.startsWith('INSERT INTO users')) {
        const [nombre, username, email, password_hash] = params;
        const user = { id: users.length + 1, nombre, username, email, password_hash };
        users.push(user);
        return [{ insertId: user.id }];
      }
      throw new Error(`Consulta de prueba no reconocida: ${sql}`);
    })
  };
  return pool;
}

async function createTestApp(users = []) {
  const pool = createPool(users);
  const app = createApp({ authService: new AuthService(pool, { rounds: 4 }) });
  return { app, pool };
}

describe('API de autenticacion', () => {
  test('registra un usuario y almacena un hash, no la contrasena original', async () => {
    const { app, pool } = await createTestApp();
    const response = await request(app).post('/api/auth/register').send({
      nombre: 'Carlos Perez',
      username: 'carlos123',
      email: 'carlos@example.com',
      password: 'ClaveSegura123'
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toEqual({
      id: 1,
      nombre: 'Carlos Perez',
      username: 'carlos123',
      email: 'carlos@example.com'
    });
    expect(JSON.stringify(response.body)).not.toContain('ClaveSegura123');
    expect(pool.users[0].password_hash).not.toBe('ClaveSegura123');
    expect(await bcrypt.compare('ClaveSegura123', pool.users[0].password_hash)).toBe(true);
  });

  test('rechaza datos incompletos', async () => {
    const { app } = await createTestApp();
    const response = await request(app).post('/api/auth/register').send({ email: 'carlos@example.com' });

    expect(response.status).toBe(400);
    expect(response.body.errors.length).toBeGreaterThan(0);
  });

  test('rechaza un correo invalido', async () => {
    const { app } = await createTestApp();
    const response = await request(app).post('/api/auth/register').send({
      nombre: 'Carlos Perez',
      username: 'carlos123',
      email: 'correo-invalido',
      password: 'ClaveSegura123'
    });

    expect(response.status).toBe(400);
  });

  test('rechaza contrasenas cuyo valor UTF-8 supera el limite de bcrypt', async () => {
    const { app } = await createTestApp();
    const response = await request(app).post('/api/auth/register').send({
      nombre: 'Carlos Perez',
      username: 'carlos123',
      email: 'carlos@example.com',
      password: 'á'.repeat(37)
    });

    expect(response.status).toBe(400);
  });

  test('rechaza un correo duplicado', async () => {
    const { app } = await createTestApp([
      { id: 1, email: 'carlos@example.com', username: 'otro123', password_hash: 'hash' }
    ]);
    const response = await request(app).post('/api/auth/register').send({
      nombre: 'Carlos Perez',
      username: 'carlos123',
      email: 'carlos@example.com',
      password: 'ClaveSegura123'
    });

    expect(response.status).toBe(409);
  });

  test('rechaza un nombre de usuario duplicado', async () => {
    const { app } = await createTestApp([
      { id: 1, email: 'otra@example.com', username: 'carlos123', password_hash: 'hash' }
    ]);
    const response = await request(app).post('/api/auth/register').send({
      nombre: 'Carlos Perez',
      username: 'carlos123',
      email: 'carlos@example.com',
      password: 'ClaveSegura123'
    });

    expect(response.status).toBe(409);
  });

  test('autentica al usuario cuando la contrasena es correcta', async () => {
    const hash = await bcrypt.hash('ClaveSegura123', 4);
    const { app } = await createTestApp([{
      id: 1,
      nombre: 'Carlos Perez',
      username: 'carlos123',
      email: 'carlos@example.com',
      password_hash: hash
    }]);
    const response = await request(app).post('/api/auth/login').send({
      email: 'carlos@example.com',
      password: 'ClaveSegura123'
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Autenticacion exitosa.');
    expect(response.body).not.toHaveProperty('password_hash');
  });

  test('rechaza una contrasena incorrecta con mensaje generico', async () => {
    const hash = await bcrypt.hash('ClaveSegura123', 4);
    const { app } = await createTestApp([{
      id: 1, nombre: 'Carlos Perez', username: 'carlos123',
      email: 'carlos@example.com', password_hash: hash
    }]);
    const response = await request(app).post('/api/auth/login').send({
      email: 'carlos@example.com',
      password: 'Incorrecta123'
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Correo o contrasena incorrectos.');
  });

  test('rechaza un usuario inexistente con el mismo mensaje generico', async () => {
    const { app } = await createTestApp();
    const response = await request(app).post('/api/auth/login').send({
      email: 'inexistente@example.com',
      password: 'ClaveSegura123'
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Correo o contrasena incorrectos.');
  });

  test('devuelve 500 cuando falla la conexion con la base de datos', async () => {
    const pool = { execute: jest.fn().mockRejectedValue(new Error('Conexion rechazada')) };
    const app = createApp({ authService: new AuthService(pool, { rounds: 4 }) });
    const errorLog = jest.spyOn(console, 'error').mockImplementation(() => {});
    const response = await request(app).post('/api/auth/login').send({
      email: 'carlos@example.com',
      password: 'ClaveSegura123'
    });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: 'Error interno del servidor.' });
    expect(errorLog).toHaveBeenCalled();
    errorLog.mockRestore();
  });

  test('informa que la API esta activa', async () => {
    const { app } = await createTestApp();
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('responde 400 cuando el cuerpo JSON esta malformado', async () => {
    const { app } = await createTestApp();
    const response = await request(app)
      .post('/api/auth/login')
      .set('Content-Type', 'application/json')
      .send('{');

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('El cuerpo de la solicitud no contiene JSON valido.');
  });
});
