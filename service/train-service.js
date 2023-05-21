const db = require('../db');
const ActionDTO = require('../dtos/action-dto');
const ActionTypeDto = require('../dtos/actionType-dto');
const TrainDTO = require('../dtos/train-dto');
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
      const newUserTrain = await db.query(
        `INSERT INTO trainings(account_id, day_team) VALUES ($1, $2) RETURNING *`,
        [account_id, day_team],
      );
      const user = await db.query(
        `SELECT * FROM users LEFT JOIN accounts ON users.id_user=accounts.id_user WHERE id_account = $1`,
        [account_id],
      );
      const newUserTrainDto = new TrainDTO({ ...newUserTrain.rows[0], ...user.rows[0] });
      newTrain.push(newUserTrainDto);
    });
    await Promise.all(promises);

    console.log('newTrain', newTrain);

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

    if (!train.rows[0]) {
      throw ApiError.BadRequest('Тренировка не найдена.');
    }

    const trainDto = train.rows.map((obj) => new TrainDTO(obj));

    return trainDto;
  }

  // Получение дат тренировок команды
  async getTeamDates(day_team) {
    if (!day_team) {
      throw ApiError.BadRequest('Не введено название команды!');
    }

    const data = await db.query(`SELECT DISTINCT date FROM trainings WHERE day_team = $1`, [
      day_team,
    ]);
    console.log(data.rows);

    const dates = data.rows.map((obj) => {
      return obj.date;
    });

    return dates;
  }

  // Проверка на наличие у команды тренировки на сегодня
  async checkTeam(team) {
    const utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    const teamData = await db.query(`SELECT * FROM trainings WHERE day_team = $1 AND date = $2`, [
      team,
      utc,
    ]);
    if (teamData.rows[0]) return false;
    else return true;
  }

  // Получение списка всех команд
  async getTeams() {
    const teams = await db.query(`SELECT DISTINCT day_team FROM trainings`);
    const res = teams.rows.map((obj) => {
      const team = obj.day_team;
      return team;
    });
    return res;
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

  // Перерасчет столбца статистики
  async calculateTrain(id_action_type, id_train, name_action) {
    const updTrain = async (column) => {
      const win_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=1 AND name_action=$1 AND id_train = $2`,
        [name_action, id_train],
      );
      const winCNum = Number(win_count.rows[0].count);
      console.log('winCNum', winCNum);
      const loss_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=-1 AND name_action=$1 AND id_train = $2`,
        [name_action, id_train],
      );
      const lossCNum = Number(loss_count.rows[0].count);
      console.log('lossCNum', lossCNum);
      const count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE name_action=$1 AND id_train=$2`,
        [name_action, id_train],
      );
      const cNum = Number(count.rows[0].count);
      console.log('cNum', cNum);
      const stat = (winCNum - lossCNum) / cNum > 0 ? (winCNum - lossCNum) / cNum : 0;
      console.log('stat', stat);
      const statFixed = +stat.toFixed(2);
      console.log('statFixed', statFixed, typeof statFixed);
      console.log('id_train', id_train);
      const upd = await db.query(
        `UPDATE trainings SET ${column} = $1 WHERE id_train = $2 RETURNING *`,
        [statFixed, id_train],
      );
      console.log('upd', upd.rows);
      return upd.rows[0];
    };

    let upd = { initial: 'initial' };

    switch (id_action_type) {
      // Подача
      case 1:
        await updTrain('inning_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Атака
      case 2:
        await updTrain('attacks_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Блокирование
      case 3:
        await updTrain('blocks_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Прием подачи
      case 4:
        await updTrain('catch_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Защита
      case 5:
        await updTrain('defence_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Передача на удар
      case 6:
        await updTrain('support_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
    }
    console.log('id', upd);
    const user = await db.query(
      `SELECT * FROM accounts LEFT JOIN users ON accounts.id_user = users.id_user WHERE id_account = $1`,
      [upd.account_id],
    );
    console.log('user', user.rows);
    return new TrainDTO({ ...user.rows[0], ...upd });
  }

  // Добавление действия
  async addAction(id_train, name_action, result, condition, score, id_action_type, date, day_team) {
    const action = await db.query(
      `INSERT INTO actions(name_action, result, condition, score, id_train, id_action_type, date, day_team) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name_action, result, condition, score, id_train, id_action_type, date, day_team],
    );
    console.log(action.rows);
    console.log('id_train', id_train);

    const updTrain = async (column) => {
      const win_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=1 AND name_action=$1 AND id_train = $2`,
        [name_action, id_train],
      );
      const winCNum = Number(win_count.rows[0].count);
      console.log('winCNum', winCNum);
      const loss_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=-1 AND name_action=$1 AND id_train = $2`,
        [name_action, id_train],
      );
      const lossCNum = Number(loss_count.rows[0].count);
      console.log('lossCNum', lossCNum);
      const count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE name_action=$1 AND id_train=$2`,
        [name_action, id_train],
      );
      const cNum = Number(count.rows[0].count);
      console.log('cNum', cNum);
      const stat = (winCNum - lossCNum) / cNum > 0 ? (winCNum - lossCNum) / cNum : 0;
      console.log('stat', stat);
      const statFixed = +stat.toFixed(2);
      console.log('statFixed', statFixed, typeof statFixed);
      console.log('id_train', id_train);
      const upd = await db.query(
        `UPDATE trainings SET ${column} = $1 WHERE id_train = $2 RETURNING *`,
        [statFixed, id_train],
      );
      console.log('upd', upd.rows);
      return upd.rows[0];
    };

    let upd = { initial: 'initial' };

    switch (id_action_type) {
      // Подача
      case 1:
        await updTrain('inning_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Атака
      case 2:
        await updTrain('attacks_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Блокирование
      case 3:
        await updTrain('blocks_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Прием подачи
      case 4:
        await updTrain('catch_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Защита
      case 5:
        await updTrain('defence_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
      // Передача на удар
      case 6:
        await updTrain('support_stat')
          .then((data) => {
            console.log('data', data);
            upd = data;
          })
          .catch((err) => {
            throw ApiError.BadRequest('Ошибка базы данных');
          });
        break;
    }
    console.log('id', upd);
    const user = await db.query(
      `SELECT * FROM accounts LEFT JOIN users ON accounts.id_user = users.id_user WHERE id_account = $1`,
      [upd.account_id],
    );
    console.log('user', user.rows);
    return new TrainDTO({ ...user.rows[0], ...upd });
  }

  // Удаление действия
  async deleteTrainAction(id_action) {
    const deletedAction = await db.query(`SELECT * FROM actions WHERE id_action = $1`, [id_action]);

    await db.query(`DELETE FROM actions WHERE id_action = $1`, [id_action]);

    return this.calculateTrain(
      deletedAction.rows[0].id_action_type,
      deletedAction.rows[0].id_train,
      deletedAction.rows[0].name_action,
    );
  }

  // Получение действий пользователя
  async getTrainActions(date, day_team) {
    const data = await db.query(
      `SELECT * FROM actions LEFT JOIN trainings ON trainings.id_train = actions.id_train LEFT JOIN accounts ON accounts.id_account = trainings.account_id LEFT JOIN users ON accounts.id_user = users.id_user WHERE actions.date = $1 AND actions.day_team = $2`,
      [date, day_team],
    );

    const actions = data.rows.map((action) => {
      return new ActionDTO({ ...action });
    });
    return actions;
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
    const actionsTypesDto = actionsTypes.rows.map((item) => {
      const actionType = new ActionTypeDto(item);
      return { ...actionType };
    });
    return actionsTypesDto;
  }
}

module.exports = new TrainService();
