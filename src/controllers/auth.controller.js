function createAuthController(authService) {
  return {
    register: async (req, res) => {
      const user = await authService.register(req.body);
      return res.status(201).json({
        message: 'Usuario registrado correctamente.',
        user
      });
    },
    login: async (req, res) => {
      const result = await authService.login(req.body);
      return res.status(200).json(result);
    }
  };
}

module.exports = createAuthController;
