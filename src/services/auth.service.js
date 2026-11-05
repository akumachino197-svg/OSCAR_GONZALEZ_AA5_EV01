const bcrypt = require('bcrypt');
const HttpError = require('../errors/HttpError');

class AuthService {
  constructor(pool, options = {}) {
    this.pool = pool;
    this.bcrypt = options.bcrypt || bcrypt;
    this.rounds = Number(options.rounds || process.env.BCRYPT_ROUNDS || 12);
  }

  async register({ nombre, username, email, password }) {
    const [existingUsers] = await this.pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ? LIMIT 1',
      [email, username]
    );

    if (existingUsers.length > 0) {
      throw new HttpError(409, 'El correo o nombre de usuario ya esta registrado.');
    }

    const passwordHash = await this.bcrypt.hash(password, this.rounds);
    try {
      const [result] = await this.pool.execute(
        'INSERT INTO users (nombre, username, email, password_hash) VALUES (?, ?, ?, ?)',
        [nombre, username, email, passwordHash]
      );

      return { id: result.insertId, nombre, username, email };
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new HttpError(409, 'El correo o nombre de usuario ya esta registrado.');
      }

      throw error;
    }
  }

  async login({ email, password }) {
    const [users] = await this.pool.execute(
      'SELECT id, nombre, username, email, password_hash FROM users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = users[0];

    if (!user || !(await this.bcrypt.compare(password, user.password_hash))) {
      throw new HttpError(401, 'Correo o contrasena incorrectos.');
    }

    return {
      id: user.id,
      nombre: user.nombre,
      username: user.username,
      email: user.email,
      message: 'Autenticacion exitosa.'
    };
  }
}

module.exports = AuthService;
