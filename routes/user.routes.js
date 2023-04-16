const Router = require('express');
const router = new Router();
const userController = require('../controller/user.controller');
const { body } = require('express-validator');

router.post(
  '/registration',
  body('email').isEmail(),
  body('password').isLength({ min: 4, max: 32 }),
  userController.createUser,
);
router.get('/users', userController.getUsers);
router.get('/user/:id', userController.getOneUser);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

module.exports = router;
