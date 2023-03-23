const Router = require('express');
const router = new Router();
const userController = require('../controller/user.controller');

router.post('/registration', userController.createUser);
router.get('/registration', userController.getUsers);
router.get('/user/:id', userController.getOneUser);

module.exports = router;
