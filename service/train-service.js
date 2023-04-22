const db = require('../db');
const ApiError = require('../exceptions/api-error');

class TrainService {
  async addTrain(account_id, day_team) {
    if (!account_id) {
      throw ApiError.UnauthorisedError();
    }
    if (!day_team) {
      throw ApiError.BadRequest('Не введено название команды!');
    }
    var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    console.log('utc', utc);
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
  async getOneTrain(account_id, date, day_team) {
    const train = await db.query(
      `SELECT * FROM trainings WHERE account_id = $1 AND date = $2 AND date = $2 AND day_team = $3`,
      [account_id, date, day_team],
    );
    return train;
  }
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
  // async getTrainsByDate(date_start, date_end) {
  //   if (!date_end) {
  //     date_end = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
  //   }
  //   if (!date_start) {
  //     date_start = await db.query(`SELECT MIN(date) FROM trainigs`)
  //   }
  // }
  async editTrain() {}
  async deleteTrain() {}
  async addAction() {}
  async editAction() {}
  async deleteAction() {}
}

module.exports = new TrainService();
