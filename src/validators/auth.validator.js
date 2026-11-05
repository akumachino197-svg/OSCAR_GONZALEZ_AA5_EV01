const { body } = require('express-validator');

const registerValidator = [
  body('nombre')
    .trim()
    .notEmpty().withMessage('El nombre es obligatorio.')
    .isLength({ max: 100 }).withMessage('El nombre no puede superar 100 caracteres.'),
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('El nombre de usuario debe tener entre 3 y 50 caracteres.')
    .matches(/^[a-zA-Z0-9_.-]+$/).withMessage('El nombre de usuario contiene caracteres no permitidos.'),
  body('email')
    .trim()
    .isEmail().withMessage('Debe proporcionar un correo electronico valido.')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('La contrasena debe ser texto.')
    .bail()
    .isLength({ min: 8 }).withMessage('La contrasena debe tener al menos 8 caracteres.')
    .bail()
    .custom((value) => Buffer.byteLength(value, 'utf8') <= 72)
    .withMessage('La contrasena no puede superar 72 bytes UTF-8.')
];

const loginValidator = [
  body('email')
    .trim()
    .isEmail().withMessage('Debe proporcionar un correo electronico valido.')
    .normalizeEmail(),
  body('password')
    .isString().withMessage('La contrasena es obligatoria.')
    .bail()
    .notEmpty().withMessage('La contrasena es obligatoria.')
];

module.exports = { registerValidator, loginValidator };
