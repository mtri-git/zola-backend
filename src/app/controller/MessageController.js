const Message = require('../../models/Message')
const Room = require('../../models/Room')
const cloudinary = require('../../configs/cloudinary.config')
const { addNewFile, unlinkAsync } = require('../../services/file.service')

class MessageController {
	async sendMessage(req, res) {
		try {
			let {roomId ,content, nanoid} = req.body
			let messageData = {roomId, content, nanoid}
			const attach_files = req.files

			if (!attach_files) {
				const message = new Message({
					...messageData,
					reaction: [],
					seen_by: [],
					deleted_at: null,
					sender: req.user.id,
				})
				await message.save()
				await Room.updateOne(
					{ _id: message.roomId },
					{ $set: { last_message: message._id } }
				)
				return res
					.status(201)
					.json({ message: 'Send message successfully' })
			}
			let uploadData = []
			for (let i = 0; i < attach_files.length; i++) {
				const data = await addNewFile(
					attach_files[i].path,
					attach_files[i].mimetype.split('/')[0],
					req.user.id
				)
				uploadData.push(data._id.toString())
			}

			// delete temp file from server after upload
			for (let i = 0; i < attach_files.length; i++) {
					await unlinkAsync(attach_files[i].path)
			}

			// console.log(uploadData)

			// const { format, resource_type, created_at, url } = uploadData
			// const file = new File({
			// 	owner: req.user.id,
			// 	resource_type: resource_type,
			// 	format: format,
			// 	url: url,
			// 	created_at: created_at,
			// })
			// await file.save()

			messageData.attach_files = uploadData
			const message = new Message({ ...messageData, sender: req.user.id, type: "media" })
			await message.save()

			res.status(200).json({ message: 'Send message successfully' })
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
			if(req.query.nanoid)
			{
				message = await Message.findOne({nanoid: req.query.nanoid})
			}
			else{
				message = await Message.findById(req.query.id)
			}
			// console.log(message.sender.toString(), ' ', req.user.id)
			
			if(message == [])
				return res.status(400).json({message: "Message not exist"})
			
			console.log("id", message.sender.toString());

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
			const room = await Room.findById(req.params.roomId)
			if (room.users.includes(req.user.id) && room) {
				const messages = await Message.where().byContentInRoom(
					req.params.roomId,
					req.query.search
				).lean()
				
				// each message in messages will have messageType property to identify type of message
				messages.forEach((message) => {
					if(message.sender.username === req.user.username)
						message.messageType = "sender"
					else
						message.messageType = "receiver"
				})

				res.status(200).json({ messages: messages })
			} else {
				res.status(401).json("You can't access this room")
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
			if (message.reaction.find((element) =>
						element.by.toString() === req.user.id &&
						element.value === req.body.value)) 
			{
				const index = message.reaction.indexOf({
					by: req.user.id,
					value: req.body.value,
				})
				message.reaction.splice(index, 1)
			} else 
			if(message.reaction.find(
				(element) =>
					element.by.toString() === req.user.id &&
					element.value !== req.body.value))
			{
				message.reaction.value = req.body.value
			}
			else{
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

	testDelete = async (req, res) => {
		try {
			const data = await cloudinary.uploader.destroy(
				'zola_files/images/zxd1zsnaznoqmwskfdip'
			)
			res.sendStatus(200)
			console.log(data)
		} catch (error) {
			res.sendStatus(401)
			console.log(error)
		}
	}
}

module.exports = new MessageController()
