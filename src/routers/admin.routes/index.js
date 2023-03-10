const express = require('express')
const router = express.Router()
const authRouter = require('../admin.routes/admin.auth.route')
const userRouter = require('../admin.routes/admin.user.route')
const roomRouter = require('../admin.routes/admin.room.route')
const postRouter = require('../admin.routes/admin.post.route')
const commentRouter = require('../admin.routes/admin.comment.route')
const statisticRouter = require('../admin.routes/admin.statistic.route')


router.use('/auth', authRouter)
router.use('/user', userRouter)
router.use('/room', roomRouter)
router.use('/post', postRouter)
router.use('/comment', commentRouter)
router.use('/statistic', statisticRouter)

module.exports = router