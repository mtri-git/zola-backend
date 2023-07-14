const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({
	phone: {
		type: String,
		lowercase: true,
		index: true,
		unique: true,
		sparse: true
		// required: true,
	},
	email: {
		type: String,
		trim: true,
		lowercase: true,
		index: true,
		unique: true,
		sparse: true
		// required: true,
	},
	username: {
		type: String,
		lowercase: true,
		unique: true,
		required: true,
	},
	fullname: {
		type: String,
		require: true,
	},
	birthday: {type: Date, default: null},
	password: {
		type: String,
		required: true,
		min: 8,
	},
	status: { type: String, default: 'offline',enum: ['online', 'offline', 'busy']  },
	blocked_users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	follower: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	following: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	not_notification: [],
	contact_info: {
		address: {
			type: String,
			default: null,
		},
		bio: {
			type: String,
			min: 160,
			default: null,
		},
	},
	avatarUrl: {
		type: String,
		default: null,
	},
	coverUrl: {
		type: String,
		default: null,
	},
	last_online: {
		type: Date,
		default: null,
	},
	created_date: {
		type: Date,
		default: Date.now,
	},
	updated_at: {
		type: Date,
		default: null,
	},
	deleted_at: {
		type: Date,
		default: null,
		index: {expires: 2592000 }
	},
},)


UserSchema.options.toJSON = {
	transform: function (doc, ret) {
	  delete ret.__v;
	  return ret
	}
  };

//virtual
UserSchema.virtual('friends').get(function () {
	return this.follower.filter((value) => this.following.includes(value))
})

// query
UserSchema.query.CustomFindUserId = function (id) {
	return this.where({ _id: id }).select(
		'fullname username contact_info birthday last_online status avatarUrl'
	)
}

UserSchema.query.byName = function (name) {
	return this.where({ name: new RegExp(name, 'i') }).select(
		'fullname username contact_info birthday last_online status avatarUrl'
	)
}

// static function
UserSchema.statics.getUserWithId = function (id) {
	return this.where({ _id: id }).select(
		'fullname username contact_info birthday last_online status avatarUrl coverUrl created_date'
	)
}

// params is object like {id: id} or {username: username}
UserSchema.statics.getUser = function (param) {
	return this.findOne(param).lean()
}

UserSchema.statics.getUserWithIdLessData = function (id, reqId) {
	return this.findById(id).select(
		'fullname follower username contact_info status avatarUrl last_online'
		)

}

// instances method
UserSchema.methods.getFriend = function () {
	const friendId = this.follower.filter((value) =>
		this.following.includes(value)
	)
	return mongoose.model('User').where({ _id: friendId })
}

// instances method
// UserSchema.methods.getFriendId = function(){
// 	const friendId = this.follower.filter((value) =>
// 				this.following.includes(value))
// 	return friendId
// }

// If modified add update date
UserSchema.pre('updateOne', (next) => {
	this.updated_at = Date.now()
	next()
})

// Delete all post, comment, file of user if user is remove
UserSchema.pre('remove', async function (next) {
	try {
		await Promise.all([
			mongoose.model('Post').deleteMany({ author: this._id }),
			mongoose.model('Comment').deleteMany({ author: this._id }),
			mongoose.model('File').deleteMany({ owner: this._id }),
		])
		next()
	} catch (error) {
		console.log('Error: ', error)
		next(error)
	}
})

const User = mongoose.model('User', UserSchema)
module.exports = User
