const express = require('express')
const router = express.Router()
const CommentController = require('../../app/controller/CommentController')
const authMiddleware = require('../../middleware/auth.middleware')
const idCheckerMiddleware = require('../../middleware/idcheck.auth.middleware')

router.get('/me', authMiddleware,authMiddleware, CommentController.getAllCommentByUserId)
router.get('/user/:username', authMiddleware,CommentController.getAllCommentByUsername)
router.get('/post/:postId',authMiddleware, CommentController.getCommentByPostId)
router.get('/reply/:id', authMiddleware, idCheckerMiddleware, CommentController.getReplyComment)
router.get('/:commentId',authMiddleware,idCheckerMiddleware ,CommentController.getComment)
router.post('/create',authMiddleware ,CommentController.createComment)
router.delete('/:commentId', authMiddleware, idCheckerMiddleware, CommentController.deleteComment)
router.put('/:commentId/like', authMiddleware, idCheckerMiddleware, CommentController.likeOrUnlikeComment)


module.exports = router