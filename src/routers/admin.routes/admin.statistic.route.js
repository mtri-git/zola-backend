const express = require('express')
const router = express.Router()
const AdminStatisticController = require('../../app/admin.controller/AdminStatisticController')
const authMiddleware = require('../../middleware/admin.auth.middleware')

router.get('/number', authMiddleware , AdminStatisticController.getStatisticNumber)
router.get('/user-join-by-mouth', authMiddleware , AdminStatisticController.getUserJoinByMonth)
router.get('/post-by-mouth', authMiddleware , AdminStatisticController.getPostByMouth)
router.get('/user-chat-by-mouth/:id', authMiddleware , AdminStatisticController.getUserChatByMonth)
router.get('/room-chat-by-mouth/:id', authMiddleware , AdminStatisticController.getRoomChatByMonth)
router.get('/user-by-age', authMiddleware , AdminStatisticController.getUserByAge)
// router.post('/create', authAdminController.createAdmin)
// router.post('/change-password', authMiddleware, authAdminController.changePassword)
// router.post('/logout', authAdminController.logout)


module.exports = router