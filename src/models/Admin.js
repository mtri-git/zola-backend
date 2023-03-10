const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Admin = new Schema({

	username: {
		type: String,
		required: true,
		unique: true,
	},
	password: {
		type: String,
		required: true,
	},
	avatarUrl: String,
    updated_at: Date,
	created_at: {
		type: Date,
		default: Date.now(),
	},
})


module.exports = mongoose.model('Admin', Admin)
