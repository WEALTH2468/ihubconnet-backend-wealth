const express = require('express');
const auth = require('../middlewares/auth');
const router = express.Router();
const notificationCtrl = require('../controllers/notification');

router.get('/:id', notificationCtrl.getNotifications);
router.post('/', notificationCtrl.addNotification);
router.delete('/dismissAll/:id', notificationCtrl.deleteNotifications);
router.delete('/dismissItem/:id', notificationCtrl.deleteNotification);


module.exports = router;
