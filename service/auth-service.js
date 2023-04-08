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
    const role = await db.query(`SELECT * FROM roles WHERE id_role = $1`, [user.rows[0].role_id]);
    const userDto = new UserDTO({ ...user.rows[0], ...role.rows[0] });
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id_account, tokens.refreshToken);
    return { ...tokens, user: { ...userDto } };
  }

  async logout(refreshToken) {
    const token = await tokenService.removeToken(refreshToken);
    return token;
  }

  async refresh(refreshToken) {
    if (!refreshToken) {
      throw ApiError.UnauthorisedError();
    }
    const userData = tokenService.validateRefreshToken(refreshToken);
    const tokenFromDb = await tokenService.findToken(refreshToken);
    if (!userData || !tokenFromDb) {
      throw ApiError.UnauthorisedError();
    }
    const user = await db.query(`SELECT * FROM accounts WHERE id_account = $1`, [
      userData.id_account,
    ]);
    const userDto = new UserDTO(user.rows[0]);
    userDto.role = userData.role;
    const tokens = tokenService.generateTokens({ ...userDto });
    await tokenService.saveToken(userDto.id_account, tokens.refreshToken);
    return { ...tokens, user: { ...userDto } };
  }
}

module.exports = new AuthService();
