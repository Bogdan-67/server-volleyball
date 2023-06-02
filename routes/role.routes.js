const Router = require('express');
const router = new Router();
const roleController = require('../controller/role.controller');
const checkRole = require('../middlewares/check-role-middleware');

router.get('/roles', checkRole('ADMIN'), roleController.getRoles);
router.post('/roles', checkRole('ADMIN'), roleController.giveRole);
router.delete('/roles', checkRole('ADMIN'), roleController.removeRole);

module.exports = router;
