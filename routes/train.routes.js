const Router = require('express');
const router = new Router();
const trainController = require('../controller/train.controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/train', authMiddleware, trainController.addTrain);
router.get('/trains/:account_id', authMiddleware, trainController.getTrains);
router.get('/train/:account_id', authMiddleware, trainController.getOneTrain);
router.put('/train', authMiddleware, trainController.editTrain);
router.delete('/train', authMiddleware, trainController.deleteTrain);

router.post('/action', authMiddleware, trainController.addAction);
router.get('/action', authMiddleware, trainController.getActions);
router.put('/action', authMiddleware, trainController.editAction);
router.delete('/action', authMiddleware, trainController.deleteAction);

module.exports = router;
