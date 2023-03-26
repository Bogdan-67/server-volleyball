const db = require('../db');
const authService = require('../service/auth-service');

class AuthController {
  async loginUser(req, res, next) {
    try {
      const { login, password } = req.body;
      const userData = await authService.login(login, password);
      res.cookie('refreshToken', userData.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.status(200).json(userData);
    } catch (e) {
      next(e);
    }
  }

  async logoutUser(req, res, next) {
    try {
    } catch (e) {}
  }

  async refreshToken(req, res, next) {
    try {
    } catch (e) {}
  }
}

module.exports = new AuthController();
