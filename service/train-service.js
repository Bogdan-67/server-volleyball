const db = require('../db');
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

  // Добавление действия
  async addAction(id_train, name_action, result, condition, score, id_action_type) {
    const action = await db.query(
      `INSERT INTO actions(name_action, result, condition, score, id_train, id_action_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name_action, result, condition, score, id_train, id_action_type],
    );
    console.log(action.rows);

    const updTrain = async (column) => {
      const win_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=1 AND name_action=$1`,
        [name_action],
      );
      const winCNum = Number(win_count.rows[0].count);
      console.log('winCNum', winCNum);
      const loss_count = await db.query(
        `SELECT COUNT(*) FROM actions WHERE score=-1 AND name_action=$1`,
        [name_action],
      );
      const lossCNum = Number(loss_count.rows[0].count);
      console.log('lossCNum', lossCNum);
      const count = await db.query(`SELECT COUNT(*) FROM actions WHERE name_action=$1`, [
        name_action,
      ]);
      const cNum = Number(count.rows[0].count);
      console.log('cNum', cNum);
      const stat = (winCNum - lossCNum) / cNum > 0 ? (winCNum - lossCNum) / cNum : 0;
      console.log('stat', stat);
      const statFixed = +stat.toFixed(2);
      console.log('statFixed', statFixed);
      const upd = await db.query(
        `UPDATE trainings SET ${column} = $1 WHERE id_train = $2 RETURNING *`,
        [statFixed, id_train],
      );
      return upd;
    };

    let upd = {};

    switch (id_action_type) {
      // Подача
      case 1:
        upd = updTrain('inning_stat');
        break;
      // Блокирование
      case 2:
        upd = updTrain('blocks_stat');
        break;
      // Атака
      case 3:
        upd = updTrain('attacks_stat');
        break;
      // Прием подачи
      case 4:
        upd = updTrain('catch_stat');
        break;
      // Защита
      case 5:
        upd = updTrain('defence_stat');
        break;
      // Передача на удар
      case 6:
        upd = updTrain('support_stat');
        break;
    }
    return upd;
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
    console.log(actionsTypesDto);
    return actionsTypesDto;
  }
}

module.exports = new TrainService();
