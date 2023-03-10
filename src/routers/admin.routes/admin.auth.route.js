const express = require('express')
const router = express.Router()
const authAdminController = require('../../app/admin.controller/AdminAuthController')
const authMiddleware = require('../../middleware/admin.auth.middleware')

router.post('/login', authAdminController.login)
router.post('/create', authAdminController.createAdmin)
router.get('/get-info', authMiddleware, authAdminController.getInfo)
router.get('/reset-token', authAdminController.getAccessToken)
// router.post('/change-password', authMiddleware, authAdminController.changePassword)
// router.post('/logout', authAdminController.logout)


module.exports = router