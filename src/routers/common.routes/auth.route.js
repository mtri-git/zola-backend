
const express = require('express')
const router = express.Router()
const authController = require('../../app/controller/AuthController')
const authMiddleware = require('../../middleware/auth.middleware')

router.post('/login', authController.login)
router.post('/verify-user', authController.isUserExisted)
router.post('/register', authController.register)
router.post('/reset-token', authController.getAccessToken)
router.post('/verify-email', authMiddleware, authController.verifyEmail)
router.post('/change-password', authMiddleware, authController.changePassword)
router.post('/reset-password', authController.resetPassword)
router.post('/logout', authMiddleware ,authController.logout)


module.exports = router