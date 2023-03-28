const db = require('../db');
const ApiError = require('../exceptions/api-error');

class TrainService {
  async addTrain(account_id) {
    if (!account_id) {
      throw ApiError.UnauthorisedError();
    }
    var utc = new Date().toJSON().slice(0, 10).replace(/-/g, '-');
    const checkTrain = await db.query(`SELECT * FROM trainings WHERE date = $1`, [utc]);
    console.log(checkTrain.rows[0]);
    if (checkTrain.rows[0]) {
      throw ApiError.BadRequest('Тренировка на данный день уже существует!');
    }
    const newTrain = await db.query(`INSERT INTO trainings(account_id) VALUES ($1) RETURNING *`, [
      account_id,
    ]);
    return newTrain;
  }
  async getOneTrain(date) {
    const train = await db.query(`SELECT * FROM trainings WHERE date = $1`, [date]);
    return train;
  }
  async getTrains(date_start, date_end) {}
  async editTrain() {}
  async deleteTrain() {}
  async addAction() {}
  async editAction() {}
  async deleteAction() {}
}

module.exports = new TrainService();
