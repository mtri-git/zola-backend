const express = require('express')
const router = express.Router()
const AdminPostController = require('../../app/admin.controller/AdminPostController')
const authMiddleware = require('../../middleware/admin.auth.middleware')

router.get('/', authMiddleware ,AdminPostController.getPost)
router.get('/user-last-post', authMiddleware , AdminPostController.getUserLastPost)
router.get('/:id', authMiddleware ,AdminPostController.getPostDetail)
router.delete('/:id', authMiddleware ,AdminPostController.softDelete)
router.put('/recover/:id', authMiddleware ,AdminPostController.recoverPost)
router.delete('/hard-delete/:id', authMiddleware ,AdminPostController.deletePost)
// router.post('/create', authAdminController.createAdmin)
// router.post('/change-password', authMiddleware, authAdminController.changePassword)
// router.post('/logout', authAdminController.logout)


module.exports = router