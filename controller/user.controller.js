const db = require('../db');

class UserController {
  async createUser(req, res) {
    try {
      const { name, surname, patronimyc, phone, email, login, password } = req.body;
      const checkPhone = await db.query(`SELECT * FROM users WHERE phone = $1`, [phone]);
      if (checkPhone.rows[0]) {
        return res
          .status(400)
          .json({ message: 'Пользователь с таким номером телефона уже зарегистрирован!' });
      }
      const checkEmail = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
      if (checkEmail.rows[0]) {
        return res
          .status(400)
          .json({ message: 'Пользователь с такой почтой уже зарегистрирован!' });
      }
      const checkLogin = await db.query(`SELECT * FROM accounts WHERE login = $1`, [login]);
      if (checkLogin.rows[0]) {
        return res
          .status(400)
          .json({ message: 'Пользователь с таким логином уже зарегистрирован!' });
      }
      const newUser = await db.query(
        `INSERT INTO users(name, surname, patronimyc, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [name, surname, patronimyc, phone, email],
      );
      const newAccount = await db.query(
        `INSERT INTO accounts(login, password, user_id) VALUES ($1, $2, $3) RETURNING *`,
        [login, password, newUser.rows[0].id_user],
      );
      res.status(200).json([newUser.rows, newAccount.rows]);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async getOneUser(req, res) {
    try {
      const id = req.params.id;
      const user = await db.query(`SELECT * FROM users WHERE id_user = $1`, [id]);
      res.status(200).json(user.rows[0]);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async getUsers(req, res) {
    try {
      const users = await db.query('SELECT * FROM users');
      res.status(200).json(users.rows);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async updateUser(req, res) {
    try {
      const { name, surname, patronimyc, phone, email } = req.body;
      const id = req.params.id;
      const user = await db.query(
        'UPDATE users SET name = $1, surname = $2, patronimyc = $3, phone = $4, email = $5 WHERE id_user = $6 RETURNING *',
        [name, surname, patronimyc, phone, email, id],
      );
      res.status(200).json(user.rows[0]);
    } catch (e) {
      res.status(500).json(e);
    }
  }

  async deleteUser(req, res) {
    try {
      const id = req.params.id;
      const user = await db.query(`DELETE FROM users WHERE id_user = $1`, [id]);
      res.status(200).json(user.rows[0]);
    } catch (e) {
      res.status(500).json(e);
    }
  }
}

module.exports = new UserController();
