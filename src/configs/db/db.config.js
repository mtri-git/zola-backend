const mongoose = require('mongoose')
require('dotenv/config')

async function connect() {
	try {
		// check if not testing environment
		if (process.env.NODE_ENV !== 'test')
			console.log('Connecting to mongodb...')

		mongoose.set('strictQuery', false)
		await mongoose.connect(process.env.DB_ONLINE)

		if (process.env.NODE_ENV !== 'test')
			console.log('Connect to mongodb successfully!')
	} catch (error) {
		if (process.env.NODE_ENV !== 'test')
			console.log('Fail to connect to database...')
	}
}

module.exports = { connect }
