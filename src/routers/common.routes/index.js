const express = require('express')
const router = express.Router()
const authRouter = require('./auth.route')
const userRouter = require('./user.route')
const roomRoute = require('./room.route')
const messageRoute = require('./message.route')
const postRoute = require('./post.route')
const commentRoute = require('./comment.route')
const otpRoute = require('./otp.route')
const fileRoute = require('./file.route')
const notificationRoute = require('./notification.route')

const adminRoute = require('../admin.routes')

const ROOT_ROUTE = '/api/v1'

router.use('/notification', notificationRoute)
router.use('/user', userRouter)
router.use('/auth', authRouter)
router.use('/room', roomRoute)
router.use('/message', messageRoute)
router.use('/post', postRoute)
router.use('/comment', commentRoute)
router.use('/otp', otpRoute)
router.use('/file', fileRoute)

module.exports = router