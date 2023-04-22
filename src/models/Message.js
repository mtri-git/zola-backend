const mongoose = require('mongoose')

const MessageSchema = new mongoose.Schema({
	nanoid: {
		type: String,
		unique: true,
		default: null
		
	},
	roomId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Room',
		required: true,
	},
	reaction: [
		{
			value: String,
			by: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User',
			},
			created_at: {
				type: Date,
				default: Date.now()
			}
		},
	],
	sender: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	content: { type: String, required: function() {
		return !this.attach_files || (this.attach_files && this.attach_files.length === 0);
	  }  },
	reply_to: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Message',
		default: null
	},
	seen_by: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		}
	],
	type: {type: String, default: "message"}, // text, image, video, file
	attach_files: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'File',
		},
	],
	created_at: {
		type: Date,
		default: Date.now,
	},
	deleted_at: {type: Date, default: null},
})

MessageSchema.query.byContentInRoom = function (roomId, search) {
	if (search)
		return this.where({
			roomId: roomId,
			deleted_at: null,
			content: new RegExp(search, 'i'),
		})
			.select('-roomId')
			.populate({
				path: 'sender',
				select: 'username status contact_info avatarUrl last_online',
			})
			.populate({
				path: 'seen_by',
				select: 'username status contact_info avatarUrl last_online',
			})
			.populate({
				path: 'attach_files',
				select: 'resource_type format url',
			})
	else
		return this.where({
			roomId: roomId,
			deleted_at: null,
		})
			.select('-roomId')
			.sort({ created_at: -1 })
			.populate({
				path: 'sender',
				select: 'username status contact_info avatarUrl last_online -_id',
			})
			.populate({
				path: 'seen_by',
				select: 'username status contact_info avatarUrl last_online',
			})
			.populate({
				path: 'attach_files',
				select: 'resource_type format url',
			})
			
}

MessageSchema.statics.getLastMessageInRoom = function (roomId) {
	return this.where({
		roomId: roomId,
	})
		.sort({ created_at: -1 })
		.limit(1)
		.select('content sender type seen_by')
		.lean()
}

const Message = mongoose.model('Message', MessageSchema)
module.exports = Message
