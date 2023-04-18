const express = require('express')
const router = express.Router()
const notificationController = require('../../app/controller/NotificationController')
const authMiddleware = require('../../middleware/auth.middleware')

router.get('/', authMiddleware ,notificationController.getAllNotification)

router.patch('/read/:id', authMiddleware ,notificationController.readNotification)

module.exports = router
