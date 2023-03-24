const Router = require('express');
const router = new Router();
const userController = require('../controller/user.controller');

router.post('/registration', userController.createUser);
router.get('/user', userController.getUsers);
router.get('/user/:id', userController.getOneUser);
router.put('/user/:id', userController.updateUser);
router.delete('/user/:id', userController.deleteUser);

module.exports = router;
