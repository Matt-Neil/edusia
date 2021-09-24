const express = require('express');
const router = express.Router();
const { getNotificationsClass, getNotificationsStudent, postNotifications, putNotifications, deleteNotifications } = require('../controllers/notifications');

router.route('/:id/student').get(getNotificationsStudent);

router.route('/:id/class').get(getNotificationsClass).put(putNotifications).delete(deleteNotifications);

router.route('/').post(postNotifications);

module.exports = router;