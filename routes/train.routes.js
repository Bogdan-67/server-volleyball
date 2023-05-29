const Router = require('express');
const router = new Router();
const trainController = require('../controller/train.controller');
const authMiddleware = require('../middlewares/auth-middleware');
const checkRole = require('../middlewares/check-role-middleware');

router.post('/train', checkRole('EDITOR'), trainController.addTrain);
router.post('/team-train', checkRole('EDITOR'), trainController.addTeamTrain);
router.get('/team-train', authMiddleware, trainController.getTeamTrain);
router.get('/team-dates', authMiddleware, trainController.getTeamDates);
router.get('/team-stat', authMiddleware, trainController.getTeamRangeStat);
router.get('/stat/:id', authMiddleware, trainController.getUserStat);
router.get('/teams', authMiddleware, trainController.getTeams);
router.get('/team/:team', authMiddleware, trainController.checkTeam);
router.get('/trains/:account_id', authMiddleware, trainController.getTrains);
router.get('/train/:account_id', authMiddleware, trainController.getOneTrain);
router.put('/train', checkRole('EDITOR'), trainController.editTrain);
router.delete('/train', checkRole('ADMIN'), trainController.deleteTrain);

router.post('/action', checkRole('EDITOR'), trainController.addAction);
router.get('/actions', authMiddleware, trainController.getActions);
router.get('/train-actions', authMiddleware, trainController.getTrainActions);
router.post('/action-types', checkRole('ADMIN'), trainController.addActionType);
router.get('/action-types', authMiddleware, trainController.getActionsTypes);
router.put('/action', checkRole('EDITOR'), trainController.editAction);
router.delete('/train-action', checkRole('EDITOR'), trainController.deleteTrainAction);
router.delete('/action', checkRole('EDITOR'), trainController.deleteAction);

module.exports = router;
