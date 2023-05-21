const Router = require('express');
const router = new Router();
const trainController = require('../controller/train.controller');
const authMiddleware = require('../middlewares/auth-middleware');

router.post('/train', authMiddleware, trainController.addTrain);
router.post('/team-train', authMiddleware, trainController.addTeamTrain);
router.get('/team-train', authMiddleware, trainController.getTeamTrain);
router.get('/team-dates', authMiddleware, trainController.getTeamDates);
router.get('/teams', authMiddleware, trainController.getTeams);
router.get('/team/:team', authMiddleware, trainController.checkTeam);
router.get('/trains/:account_id', authMiddleware, trainController.getTrains);
router.get('/train/:account_id', authMiddleware, trainController.getOneTrain);
router.put('/train', authMiddleware, trainController.editTrain);
router.delete('/train', authMiddleware, trainController.deleteTrain);

router.post('/action', authMiddleware, trainController.addAction);
router.get('/actions', authMiddleware, trainController.getActions);
router.get('/train-actions', authMiddleware, trainController.getTrainActions);
router.post('/action-types', authMiddleware, trainController.addActionType);
router.get('/action-types', authMiddleware, trainController.getActionsTypes);
router.put('/action', authMiddleware, trainController.editAction);
router.delete('/train-action', authMiddleware, trainController.deleteTrainAction);
router.delete('/action', authMiddleware, trainController.deleteAction);

module.exports = router;
