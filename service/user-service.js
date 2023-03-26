const db = require('../db');
const bcrypt = require('bcrypt');
const tokenService = require('../service/token-service');
const UserDTO = require('../dtos/user-dto');
const ApiError = require('../exceptions/api-error');

class UserService {
  async createUser({ name, surname, patronimyc, phone, email, login, password }) {
    const checkPhone = await db.query(`SELECT * FROM users WHERE phone = $1`, [phone]);
    if (checkPhone.rows[0]) {
      throw ApiError.BadRequest('Пользователь с таким номером телефона уже зарегистрирован!');
    }
    const checkEmail = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
    if (checkEmail.rows[0]) {
      throw ApiError.BadRequest('Пользователь с такой почтой уже зарегистрирован!');
    }
    const checkLogin = await db.query(`SELECT * FROM accounts WHERE login = $1`, [login]);
    if (checkLogin.rows[0]) {
      throw ApiError.BadRequest('Пользователь с таким логином уже зарегистрирован!');
    }
    const newUser = await db.query(
      `INSERT INTO users(name, surname, patronimyc, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, surname, patronimyc, phone, email],
    );
    const hashPassword = await bcrypt.hash(password, 3);
    const newAccount = await db.query(
      `INSERT INTO accounts(login, password, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [login, hashPassword, newUser.rows[0].id_user],
    );
    const userDto = new UserDTO(newAccount);
    const tokens = tokenService.generateTokens({ userDto });
    await tokenService.saveToken(newAccount.rows[0].id_account, tokens.refreshToken);
    return { ...newUser.rows[0], ...newAccount.rows[0], ...tokens };
  }

  async getOneUser(id) {
    const user = await db.query(`SELECT * FROM users WHERE id_user = $1`, [id]);
    return user;
  }

  async getUsers(req, res) {
    const users = await db.query('SELECT * FROM users');
    return users;
  }

  async updateUser({ name, surname, patronimyc, phone, email }, id) {
    const user = await db.query(
      'UPDATE users SET name = $1, surname = $2, patronimyc = $3, phone = $4, email = $5 WHERE id_user = $6 RETURNING *',
      [name, surname, patronimyc, phone, email, id],
    );
    return user;
  }

  async deleteUser(id) {
    const user = await db.query(`DELETE FROM users WHERE id_user = $1`, [id]);
    return user;
  }
}

module.exports = new UserService();
