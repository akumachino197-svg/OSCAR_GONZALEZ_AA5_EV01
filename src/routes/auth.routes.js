const express = require('express');
const createAuthController = require('../controllers/auth.controller');
const asyncHandler = require('../middlewares/asyncHandler');
const validateRequest = require('../middlewares/validateRequest');
const { registerValidator, loginValidator } = require('../validators/auth.validator');

function createAuthRoutes(authService) {
  const router = express.Router();
  const controller = createAuthController(authService);

  router.post('/register', registerValidator, validateRequest, asyncHandler(controller.register));
  router.post('/login', loginValidator, validateRequest, asyncHandler(controller.login));

  return router;
}

module.exports = createAuthRoutes;
