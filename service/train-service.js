const db = require('../db');
const ApiError = require('../exceptions/api-error');

class TrainService {
  // Добавление тренировки пользователю
  async addTrain(account_id, day_team) {
    if (!account_id) {
      throw ApiError.UnauthorisedError();
    }
    if (!day_team) {
      throw ApiError.BadRequest('Не введено название команды!');
    }
    // var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    // console.log('utc', utc);
    // const checkTrain = await db.query(`SELECT * FROM trainings WHERE date = $1`, [utc]);
    // console.log(checkTrain.rows[0]);
    // if (checkTrain.rows[0]) {
    //   throw ApiError.BadRequest('Тренировка на данный день уже существует!');
    // }
    const newTrain = await db.query(
      `INSERT INTO trainings(account_id, day_team) VALUES ($1, $2) RETURNING *`,
      [account_id, day_team],
    );
    return newTrain;
  }
  // Добавление тренировок пользователям введенной команды
  async addTeamTrain(account_id, day_team, players) {
    if (!account_id) {
      throw ApiError.UnauthorisedError();
    }
    if (!day_team) {
      throw ApiError.BadRequest('Не введено название команды!');
    }
    if (!players) {
      throw ApiError.BadRequest('В команде нет ни одного игрока!');
    }
    if (!Array.isArray(players)) {
      throw ApiError.BadRequest('players не является массивом!');
    }

    const errors = players.map(async (item) => {
      if (typeof item != 'object') {
        throw ApiError.BadRequest('элемент players не является объектом!');
      }
      if (!item.hasOwnProperty('name')) {
        throw ApiError.BadRequest('в элементе players нет свойства name!');
      }
      if (!item.hasOwnProperty('surname')) {
        throw ApiError.BadRequest('в элементе players нет свойства surname!');
      }
      const checkPlayer = await db.query(`SELECT * FROM users WHERE name = $1 AND surname = $2`, [
        item.name,
        item.surname,
      ]);
      if (!checkPlayer.rows[0]) {
        throw ApiError.BadRequest('Введен несуществующий пользователь!');
      }
      var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
      console.log('utc', utc);
      const checkTeamToday = await db.query(
        `SELECT * FROM trainings WHERE date = $1 AND day_team = $2`,
        [utc, day_team],
      );
      if (checkTeamToday.rows[0]) {
        throw ApiError.BadRequest('У этой команды уже есть тренировка на сегодня!');
      }
    });
    await Promise.all(errors);

    const newTrain = [];

    const promises = players.map(async (item) => {
      console.log('name:', item.name, 'surname', item.surname);
      const getUser = await db.query(`SELECT * FROM users WHERE name = $1 AND surname = $2`, [
        item.name,
        item.surname,
      ]);
      console.log('user:', getUser.rows[0]);
      const getUserAccount = await db.query(`SELECT * FROM accounts WHERE id_user = $1`, [
        getUser.rows[0].id_user,
      ]);
      const newUserTrain = await db.query(
        `INSERT INTO trainings(account_id, day_team) VALUES ($1, $2) RETURNING *`,
        [getUserAccount.rows[0].id_account, day_team],
      );
      newTrain.push(newUserTrain.rows[0]);
    });
    await Promise.all(promises);

    return newTrain;
  }

  // Получение тренировок пользователей введенной команды
  async addTeamTrain(account_id, day_team, date) {
    if (!account_id) {
      throw ApiError.UnauthorisedError();
    }
    if (!day_team) {
      throw ApiError.BadRequest('Не введено название команды!');
    }
    if (!date) {
      throw ApiError.BadRequest('Не введена дата!');
    }

    const train = await db.query(
      `SELECT * FROM trainings LEFT JOIN accounts ON trainings.account_id=accounts.id_account LEFT JOIN users ON users.id_user=accounts.id_user WHERE day_team = $1 AND date = $2`,
      [day_team, date],
    );

    return train;
  }

  // Получение тренировки пользователя по команде и дате
  async getOneTrain(account_id, date, day_team) {
    const train = await db.query(
      `SELECT * FROM trainings WHERE account_id = $1 AND date = $2 AND date = $2 AND day_team = $3`,
      [account_id, date, day_team],
    );
    return train;
  }

  // Получение тренировок пользователя за заданный период
  async getTrains(account_id, date_start, date_end) {
    if (!account_id) {
      throw ApiError.UnauthorisedError();
    }
    if (!date_end) {
      let date = new Date().toLocaleString().slice(0, 10).replaceAll('.', '-');
      let new_date = date.slice(6, 10) + '-' + date.slice(3, 5) + '-' + date.slice(0, 2);
      date_end = new_date;
      console.log('date_end:', date_end);
    }
    if (!date_start) {
      const date = await db.query(`SELECT MIN(date) FROM trainings WHERE account_id = $1`, [
        account_id,
      ]);
      date_start = date.rows[0].min;
      console.log('date_start:', date_start);
    }
    const trains = await db.query(
      `SELECT * FROM trainings WHERE account_id = $1 AND date BETWEEN $2 AND $3`,
      [account_id, date_start, date_end],
    );
    return trains;
  }

  // Редактирование тренировки
  async editTrain() {}
  async deleteTrain() {}
  async addAction() {}
  async editAction() {}
  async deleteAction() {}
}

module.exports = new TrainService();
