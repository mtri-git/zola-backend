const express = require('express')
const router = express.Router()
const AdminUserController = require('../../app/admin.controller/AdminUserController')
const authMiddleware = require('../../middleware/admin.auth.middleware')

router.get('/', authMiddleware ,AdminUserController.getUser)
router.get('/:id', authMiddleware ,AdminUserController.getUserDetail)
router.delete('/:id', authMiddleware ,AdminUserController.softDeleteUser)
router.delete('/hard-delete/:id', authMiddleware ,AdminUserController.deleteUser)
router.put('/recover/:id', authMiddleware ,AdminUserController.recoverUser)


module.exports = router