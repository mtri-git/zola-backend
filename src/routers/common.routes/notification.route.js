const express = require('express')
const router = express.Router()
const notificationController = require('../../app/controller/NotificationController')
const authMiddleware = require('../../middleware/auth.middleware')

router.get('/', authMiddleware ,notificationController.getAllNotification)

router.get('/unread', authMiddleware ,notificationController.getUnreadNotification)

router.get('/count-unread', authMiddleware ,notificationController.countUnreadNotification)

router.patch('/read-all', authMiddleware ,notificationController.readAllNotification)

router.patch('/read/:id', authMiddleware ,notificationController.readNotification)

router.delete('/delete-all', authMiddleware ,notificationController.deleteAllNotification)

router.delete('/delete/:id', authMiddleware ,notificationController.deleteNotification)

router.get('/call/:id', authMiddleware ,notificationController.startVideoCallFromMobile)

router.post('/test' ,notificationController.testNotificationFirebase)

router.post('/test-io' ,notificationController.testIo)

module.exports = router
