const db = require('../db');
const UserDTO = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');
const tokenService = require('./token-service');
const bcrypt = require('bcrypt');

class AuthService {
  async login(login, password) {
    const user = await db.query(`SELECT * FROM accounts WHERE login = $1`, [login]);
    if (!user.rows[0]) {
      throw ApiError.BadRequest('Пользователь с таким логином не найден!');
    }
    const isPassEquals = await bcrypt.compare(password, user.rows[0].password);
    if (!isPassEquals) {
      throw ApiError.BadRequest('Неверный пароль!');
    }
    const userDto = new UserDTO(user.rows[0]);
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id_account, tokens.refreshToken);
    return { ...tokens, ...userDto };
  }
}

module.exports = new AuthService();
