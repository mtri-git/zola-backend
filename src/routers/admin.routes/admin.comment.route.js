const express = require('express')
const router = express.Router()
const AdminCommentController = require('../../app/admin.controller/AdminCommentController')
const authMiddleware = require('../../middleware/admin.auth.middleware')

router.get('/', authMiddleware ,AdminCommentController.getComment)
router.delete('/:id', authMiddleware ,AdminCommentController.softDelete)
router.put('/recover/:id', authMiddleware ,AdminCommentController.recoverComment)
router.delete('/hard-delete/:id', authMiddleware ,AdminCommentController.deleteComment)


module.exports = router