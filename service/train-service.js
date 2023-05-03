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
      // if (typeof item != 'object') {
      //   throw ApiError.BadRequest('элемент players не является объектом!');
      // }
      // if (!item.hasOwnProperty('name')) {
      //   throw ApiError.BadRequest('в элементе players нет свойства name!');
      // }
      // if (!item.hasOwnProperty('surname')) {
      //   throw ApiError.BadRequest('в элементе players нет свойства surname!');
      // }
      // const checkPlayer = await db.query(`SELECT * FROM users WHERE name = $1 AND surname = $2`, [
      //   item.name,
      //   item.surname,
      // ]);
      if (typeof item != 'number') {
        throw ApiError.BadRequest('id_account не является числом!');
      }
      const checkPlayer = await db.query(`SELECT * FROM accounts WHERE id_account = $1`, [item]);
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

    const promises = players.map(async (account_id) => {
      // console.log('name:', item.name, 'surname', item.surname);
      // const getUser = await db.query(`SELECT * FROM users WHERE name = $1 AND surname = $2`, [
      //   item.name,
      //   item.surname,
      // ]);
      // console.log('user:', getUser.rows[0]);
      // const getUserAccount = await db.query(`SELECT * FROM accounts WHERE id_user = $1`, [
      //   getUser.rows[0].id_user,
      // ]);
      // const newUserTrain = await db.query(
      //   `INSERT INTO trainings(account_id, day_team) VALUES ($1, $2) RETURNING *`,
      //   [getUserAccount.rows[0].id_account, day_team],
      // );
      const newUserTrain = await db.query(
        `INSERT INTO trainings(account_id, day_team) VALUES ($1, $2) RETURNING *`,
        [account_id, day_team],
      );
      newTrain.push(newUserTrain.rows[0]);
    });
    await Promise.all(promises);

    return newTrain;
  }

  // Получение тренировок пользователей введенной команды
  async getTeamTrain(account_id, day_team, date) {
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

  // Получение тренировок пользователей введенной команды
  async checkTeam(team) {
    const utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    const teamData = await db.query(`SELECT * FROM trainings WHERE day_team = $1 AND date = $2`, [
      team,
      utc,
    ]);
    console.log('teamData', teamData);
    if (teamData.rows[0]) return false;
    else return true;
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

  // Удаление тренировки
  async deleteTrain() {}

  // Добавление действия
  async addAction(id_train, name_action, result, condition, score, id_action_type) {
    const action = await db.query(
      `INSERT INTO actions(name_action, result, condition, score, id_train, id_action_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name_action, result, condition, score, id_train, id_action_type],
    );
    console.log(action.rows);
    const findTrain = await db.query(`SELECT * FROM trainings WHERE id_train = $1`, [id_train]);

    const updTrain = async (column) => {
      const win_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=1 AND name_action=$1`,
        [name_action],
      );
      const loss_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=-1 AND name_action=$1`,
        [name_action],
      );
      const count = await db.query(`SELECT COUNT(*) FROM actions WHERE name_action=$1`, [
        name_action,
      ]);
      const stat = (win_count - loss_count) / count;
      const upd = await db.query(`UPDATE trainings SET $1 = $2 WHERE id_train = $3`, [
        column,
        stat,
        id_train,
      ]);
      return upd;
    };

    switch (id_action_type) {
      // Подача
      case 1:
        updTrain('inning_stat');
        break;
      // Атака
      case 2:
        updTrain('attacks_stat');
        break;
      // Блокирование
      case 3:
        break;
      // Прием подачи
      case 4:
        break;
      // Защита
      case 5:
        break;
      // Передача на удар
      case 6:
        break;
    }
    return action.rows[0];
  }

  // Получение действий пользователя
  async getActions() {}

  // Редактирование действия
  async editAction() {}

  // Удаление действия
  async deleteAction() {}

  // Добавление типа действия
  async addActionType(name_type, result, win_condition, loss_condition, description) {
    const actionType = await db.query(
      `INSERT INTO action_types(name_type, result, win_condition, loss_condition, description) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name_type, result, win_condition, loss_condition, description],
    );
    console.log(actionType.rows);
    return actionType.rows[0];
  }

  // Получение типов действий
  async getActionsTypes() {
    const actionsTypes = await db.query(`SELECT * FROM action_types`);
    return actionsTypes.rows;
  }
}

module.exports = new TrainService();
