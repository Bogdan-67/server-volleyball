const Router = require('express');
const router = new Router();
const accountController = require('../controller/account.controller');

router.post('/registration', accountController.createAccount);
router.get('/user', accountController.getOneAccount);

module.exports = router;
