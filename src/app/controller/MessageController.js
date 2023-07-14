const Message = require('../../models/Message')
const Room = require('../../models/Room')
const User = require('../../models/User')
const cloudinary = require('../../configs/cloudinary.config')
const {
	addNewMessageFile,
	unlinkAsync,
} = require('../../services/message_file.service')

const messageDataConfig = {
	image: {
		maxFiles: 10,
		acceptedTypes: ['image'],
	},
	video: {
		maxFiles: 1,
		acceptedTypes: ['video'],
	},
	audio: {
		maxFiles: 1,
		acceptedTypes: ['audio'],
	},
	file: {
		maxFiles: 1,
		acceptedTypes: ['file'],
	},
}

class MessageController {
	async sendMessage(req, res) {
		try {
			let { roomId, content, nanoid } = req.body
			let messageData = { roomId, content, nanoid }

			const message = new Message({ ...messageData, sender: req.user.id })
			await message.save()

			res.status(200).json({ message: 'Send message successfully' })
		} catch (err) {
			console.log('Send message: ', err)
			res.status(500).json({ message: 'Error' })
		}
	}

	async sendFileMessage(req, res) {
		try {
			let { roomId, content, nanoid, type } = req.body
			let messageData = { roomId, content, nanoid, type }
			const req_attach_files = req.files

			// check file type
			const messageDataType = messageDataConfig[messageData.type]

			if (!messageDataType) {
				return res.status(400).json({ message: 'Invalid message type' })
			}

			const { maxFiles, acceptedTypes } = messageDataType

			// const isAcceptedType = req_attach_files.every((file) =>
			// 	acceptedTypes.includes(file.mimetype.split('/')[0])
			// )

			// if (!isAcceptedType) {
			// 	return res
			// 		.status(400)
			// 		.json({
			// 			message: `Type is ${
			// 				messageData.type
			// 			} but attach_files is not ${acceptedTypes.join('/')}`,
			// 		})
			// }

			if (req_attach_files.length > maxFiles) {
				return res.status(400).json({
					message: `Max ${maxFiles} ${messageData.type} files`,
				})
			}

			// upload file to cloudinary
			let uploadData = []
			for (let i = 0; i < req_attach_files.length; i++) {
				const data = await addNewMessageFile(
					req_attach_files[i].path,
					req_attach_files[i].mimetype.split('/')[0],
					req.user.id
				)
				uploadData.push(data._id.toString())
			}

			// delete temp file from server after upload
			for (let i = 0; i < req_attach_files.length; i++) {
				await unlinkAsync(req_attach_files[i].path)
			}
			messageData.attach_files = uploadData
			const message = new Message({
				...messageData,
				sender: req.user.id,
				type,
			})
			await message.save()

			const result = await Message.findOne({ _id: message._id })
				.select(
					'content type created_at seen_by sender reply_to attach_files'
				)
				.populate({
					path: 'sender',
					select: 'username fullname avatarUrl -_id',
				})
				.populate({
					path: 'seen_by',
					select: 'username status contact_info avatarUrl last_online',
				})
				.populate({
					path: 'attach_files',
					select: 'resource_type format url',
				})
				.lean()

			result.messageType = 'sender'

			res.status(200).json({ data: result })
		} catch (err) {
			console.log('Send message: ', err)
			res.status(500).json({ message: 'Error' })
		}
	}

	async getMessageById() {
		try {
			const message = await Message.findById(id)
			console.log(message)
			res.status(200).json(message)
		} catch (error) {
			console.log(error)
			res.sendStatus(401)
		}
	}

	async recallMessage(req, res) {
		try {
			let message = null
			if (req.query.nanoid) {
				message = await Message.findOne({ nanoid: req.query.nanoid })
			} else {
				message = await Message.findById(req.query.id)
			}
			// console.log(message.sender.toString(), ' ', req.user.id)

			if (message == [])
				return res.status(400).json({ message: 'Message not exist' })

			console.log('id', message.sender.toString())

			if (req.user.id !== message.sender.toString())
				return res.status(401).json({ message: 'Not authorize' })
			message.deleted_at = Date.now()
			await message.save()
			res.status(200).json({ message: 'Delete message successful' })
		} catch (error) {
			console.log(error)
			res.status(401).json({ message: 'Error' })
		}
	}

	async getMessageByRoomId(req, res) {
		try {
			let { limit, page } = req.query
			
			if (!limit) limit = 20
			else limit = parseInt(limit)

			if (!page) page = 1
			else page = parseInt(page)

			const room = await Room.findById(req.params.roomId)
			if (room.users.includes(req.user.id) && room) {
				const messages = await Message.where()
					.byContentInRoom(
						req.params.roomId,
						req.query.search,
						limit,
						page
					)
					.lean()

				// each message in messages will have messageType property to identify type of message
				messages.forEach((message) => {
					if (message.sender.username === req.user.username)
						message.messageType = 'sender'
					else message.messageType = 'receiver'
				})

				// pagination data
				const total = await Message.where()
					.byContentInRoom(req.params.roomId, req.query.search)
					.countDocuments()
				const pagination = {
					total: total,
					limit: limit,
					page: page,
					pages: Math.ceil(total / limit),
				}

				res.status(200).json({ messages: messages, pagination })
			} else {
				res.status(401).json({ message: "You can't access this room" })
			}
		} catch (error) {
			console.log('Error get message: ', error)
			res.status(500).json({ Error: error })
		}
	}
	async addReaction(req, res) {
		try {
			let message = await Message.findById(req.params.messageId)
			if (!message) {
				return res.status(404).json({ message: 'Message not existed' })
			}
			// Check is this user in this room to react this message
			const room = await Room.findById(message.roomId)
			if (!room.users.includes(req.user.id)) {
				return res
					.status(401)
					.json({ message: 'Not authorized for this' })
			}

			// find the reaction in message if exist delete it if not add new reaction
			if (
				message.reaction.find(
					(element) =>
						element.by.toString() === req.user.id &&
						element.value === req.body.value
				)
			) {
				const index = message.reaction.indexOf({
					by: req.user.id,
					value: req.body.value,
				})
				message.reaction.splice(index, 1)
			} else if (
				message.reaction.find(
					(element) =>
						element.by.toString() === req.user.id &&
						element.value !== req.body.value
				)
			) {
				message.reaction.value = req.body.value
			} else {
				message.reaction.push({
					by: req.user.id,
					value: req.body.value,
				})
			}
			await message.save()
			console.log(message.reaction)
			res.status(200).json({ message: 'React to a message successfully' })
		} catch (error) {
			res.status(500).json({ Error: 'Not authentication' })
		}
	}
}

module.exports = new MessageController()
