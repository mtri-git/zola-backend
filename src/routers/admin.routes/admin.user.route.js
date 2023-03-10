const express = require('express')
const router = express.Router()
const AdminUserController = require('../../app/admin.controller/AdminUserController')
const authMiddleware = require('../../middleware/admin.auth.middleware')

router.get('/', authMiddleware ,AdminUserController.getUser)
// router.post('/create', authAdminController.createAdmin)
// router.post('/change-password', authMiddleware, authAdminController.changePassword)
// router.post('/logout', authAdminController.logout)
router.get('/:id', authMiddleware ,AdminUserController.getUserDetail)
router.delete('/:id', authMiddleware ,AdminUserController.softDeleteUser)
router.delete('/hard-delete/:id', authMiddleware ,AdminUserController.deleteUser)
router.put('/recover/:id', authMiddleware ,AdminUserController.recoverUser)


module.exports = router