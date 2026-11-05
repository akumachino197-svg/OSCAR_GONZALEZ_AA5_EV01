const { validationResult } = require('express-validator');

function validateRequest(req, res, next) {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    return res.status(400).json({
      message: 'La solicitud contiene datos invalidos.',
      errors: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
    });
  }

  return next();
}

module.exports = validateRequest;
