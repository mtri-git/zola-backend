const express = require('express')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const morgan = require('morgan')
const compression = require('compression')
const route = require('./routers')
const mongoDb = require('./configs/db/db.config')
const redis = require('./services/redis.service')
const admin_firebase = require('./services/firebase.service')

const app = express()

//set up for json
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(cookieParser())
app.use(compression())
app.use(
	cors({
		origin: [
			'http://localhost:5173',
			'http://localhost:5175',
			'https://zola-social.netlify.app',
			'https://zola-admin.vercel.app'
		],
		credentials: true,
	})
)

// log morgan
// check if production or test
// if(process.env.NODE_ENV === 'production')
app.use(morgan('default'))

// app.use(morgan({ stream: accessLogStream }))

// if (app.get('env') == 'production') {
// 	var accessLogStream = fs.createWriteStream(
// 		path.join(__dirname, '..', 'logs', 'access.log'),
// 		{ flags: 'a' }
// 	)
// 	app.use(morgan({ stream: accessLogStream }))
// } else {
// 	app.use(morgan('dev')) //log to console on development
// }

// Firebase init
admin_firebase.init()

// Connect db
mongoDb.connect()
redis.connect()
// socket

route(app)

app.use((err, req, res, next) => {
	console.log('Error: ', err)
	next(err)
})	

app.get('/*', (req, res) => {
	res.send('GET request to the homepage')
})

module.exports = app
