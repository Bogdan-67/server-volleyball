const db = require('../db');
const UserService = require('../service/user-service.js');

class UserController {
  async createUser(req, res, next) {
    try {
      const createdUser = await UserService.createUser(req.body);
      console.log('createdUser:', createdUser);
      res.cookie('refreshToken', createdUser.refreshToken, {
        maxAge: 30 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      });
      res.status(200).json(createdUser);
    } catch (e) {
      next(e);
    }
  }

  async getOneUser(req, res, next) {
    try {
      const getUser = await UserService.getOneUser(req.params.id);
      res.status(200).json(getUser.rows[0]);
    } catch (e) {
      next(e);
    }
  }

  async getUsers(req, res, next) {
    try {
      const getUsers = await UserService.getUsers();
      res.status(200).json(getUsers.rows);
    } catch (e) {
      next(e);
    }
  }

  async updateUser(req, res, next) {
    try {
      const updatedUser = await UserService.updateUser(req.body, req.params.id);
      res.status(200).json(updatedUser.rows[0]);
    } catch (e) {
      next(e);
    }
  }

  async deleteUser(req, res, next) {
    try {
      const deletedUser = await UserService.deleteUser(req.params.id);
      res.status(200).json(deletedUser.rows[0]);
    } catch (e) {
      next(e);
    }
  }
}

module.exports = new UserController();
