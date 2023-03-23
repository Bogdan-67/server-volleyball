const db = require('../db');

class UserController {
  async createUser(req, res) {
    const { name, surname, patronimyc, phone, email, login, password } = req.body;
    console.log(name, surname, patronimyc, phone, email, login, password);
    const users = await db.query('SELECT phone, email FROM users');
    console.log(users);
    for (let i = 0; i < users.rows.length; i++) {
      if (phone === users.rows[i].phone) {
        return res
          .status(400)
          .json({ message: 'Пользователь с таким номером телефона уже зарегистрирован!' });
      }
      console.log(users.rows[i].email);
      if (email === users.rows[i].email) {
        return res
          .status(400)
          .json({ message: 'Пользователь с такой почтой уже зарегистрирован!' });
      }
    }
    const logins = await db.query('SELECT login FROM accounts');
    console.log(logins);
    for (let i = 0; i < logins.rows.length; i++) {
      if (login === logins.rows[i].phone) {
        return res
          .status(400)
          .json({ message: 'Пользователь с таким логином уже зарегистрирован!' });
      }
    }
    const newUser = await db.query(
      `INSERT INTO users(name, surname, patronimyc, phone, email) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, surname, patronimyc, phone, email],
    );
    const newAccount = await db.query(
      `INSERT INTO accounts(login, password, user_id) VALUES ($1, $2, $3) RETURNING *`,
      [login, password, newUser.rows[0].id_user],
    );
    res.json([newUser.rows, newAccount.rows]);
  }
  async getOneUser(req, res) {}
  async getUsers(req, res) {
    const users = await db.query('SELECT * FROM users');
    res.json(users.rows);
  }
}

module.exports = new UserController();
