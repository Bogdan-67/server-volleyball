const trainService = require('../service/train-service');
const ApiError = require('../exceptions/api-error');

class TrainController {
  async addTrain(req, res, next) {
    try {
      const { account_id, day_team } = req.body;
      const newTrain = await trainService.addTrain(account_id, day_team);
      res.status(200).json(newTrain.rows[0]);
    } catch (e) {
      next(e);
    }
  }
  async addTeamTrain(req, res, next) {
    try {
      const { players, account_id, day_team } = req.body;
      const newTeamTrain = await trainService.addTeamTrain(account_id, day_team, players);
      res.status(200).json(newTeamTrain);
    } catch (e) {
      next(e);
    }
  }
  async getTeamTrain(req, res, next) {
    try {
      const { date, account_id, day_team } = req.query;
      const teamTrain = await trainService.addTeamTrain(account_id, day_team, date);
      res.status(200).json(teamTrain.rows);
    } catch (e) {
      next(e);
    }
  }
  async getOneTrain(req, res, next) {
    try {
      const account_id = req.params.account_id;
      const { date, day_team } = req.query;
      console.log(date);
      const train = await trainService.getOneTrain(account_id, date, day_team);
      console.log(train);
      res.status(200).json(train.rows[0]);
    } catch (e) {
      next(e);
    }
  }
  async getTrains(req, res, next) {
    try {
      const account_id = req.params.account_id;
      const { date_start, date_end } = req.query;
      console.log('date_start:', date_start, 'date_end:', date_end);
      const trains = await trainService.getTrains(account_id, date_start, date_end);
      res.status(200).json(trains.rows);
    } catch (e) {
      next(e);
    }
  }
  // async getTrainsByDate(req, res, next) {
  //   try {
  //     const { date_start, date_end, account_id } = req.params;
  //     const trains = await trainService.getTrainsByDate(date_start, date_end);
  //     res.status(200).json(trains.rows);
  //   } catch (e) {
  //     next(e);
  //   }
  // }
  async editTrain(req, res, next) {
    try {
    } catch (e) {
      next(e);
    }
  }
  async deleteTrain(req, res, next) {
    try {
    } catch (e) {
      next(e);
    }
  }
  async addAction(req, res, next) {
    try {
    } catch (e) {
      next(e);
    }
  }
  async getActions(req, res, next) {
    try {
    } catch (e) {
      next(e);
    }
  }
  async editAction(req, res, next) {
    try {
    } catch (e) {
      next(e);
    }
  }
  async deleteAction(req, res, next) {
    try {
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new TrainController();
