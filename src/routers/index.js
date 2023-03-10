const authRouter = require('./auth.route')
const userRouter = require('./user.route')
const roomRoute = require('./room.route')
const messageRoute = require('./message.route')
const postRoute = require('./post.route')
const commentRoute = require('./comment.route')
const otpRoute = require('./otp.route')
const fileRoute = require('./file.route')

const adminRoute = require('./admin.routes')

const ROOT_ROUTE = '/api/v1'

function route(app){

    app.use(ROOT_ROUTE + '/user', userRouter)
    app.use(ROOT_ROUTE + '/auth', authRouter)
    app.use(ROOT_ROUTE + '/room', roomRoute)
    app.use(ROOT_ROUTE + '/message', messageRoute)
    app.use(ROOT_ROUTE + '/post', postRoute)
    app.use(ROOT_ROUTE + '/comment', commentRoute)
    app.use(ROOT_ROUTE + '/otp', otpRoute)
    app.use(ROOT_ROUTE + '/file', fileRoute)
    app.use(ROOT_ROUTE + '/admin', adminRoute)

}

module.exports = route