const mongoose = require('mongoose')
const RoomSchema = new mongoose.Schema({
	name: { type: String },
	users: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	created_by: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
	},
	isRoom: {
		type: Boolean,
		default: false,
	},
	admins: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
	deleted_at: {type: Date, default: null, index: {expires: 604800}}
})

// before remove room => remove all message in room
RoomSchema.pre('remove', async function (next) {
	await this.model('Message').deleteMany({ roomId: this._id })
	next()
})

//virtual
RoomSchema.virtual('last_message', {
	ref: 'Message',
	localField: '_id',
	foreignField: 'roomId',
	options: {
	  sort: { created_at: -1 },
	  limit: 1,
	},
  });
  

// statics
RoomSchema.statics.getRoomById = async function (id) {
	const room =  await this.findOne({ _id: id, deleted_at: null })
		.populate({
			path: 'users',
			select: 'contact_info username fullname status avatarUrl',
		})
		.populate({
			path: 'created_by',
			select: 'contact_info username fullname status avatarUrl',
		})
		
		// .populate({
		// 	path: 'last_message',
		// 	select: 'sender content type created_at deleted_at',
		// 	populate: { path: 'sender', select: 'fullname -_id' },
		// })
		.lean()

	// if (room.last_message?.deleted_at) room.last_message = null

	return room
}

RoomSchema.statics.getRoomByUserId = function (id) {
	const rooms = this.where({ users: id, deleted_at: null })
		// .populate({
		// 	path: 'users',
		// 	select: 'username status avatarUrl last_online contact_info',
		// })
		.populate({
			path: 'last_message',
			select: 'sender content type created_at deleted_at',
			populate: { path: 'sender', select: 'fullname -_id' },
		})
		.populate({ path: 'users', select: '-_id username fullname avatarUrl' })
		.lean()
	// const filterRoom = rooms.map(room => {
	// 	if(room.last_message?.deleted_at)
	// 		room.last_message = null
	// 	return room
	// })

	return rooms
}

RoomSchema.post('save', (next) => {
	this.updated_at = Date.now()
	// next()
})

// If modified add update date
RoomSchema.post('updateOne', (next) => {
	this.updated_at = Date.now()
	// next()
})

const Room = mongoose.model('Room', RoomSchema)
module.exports = Room
//  module.exports = Room
