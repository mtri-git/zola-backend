const socketIo = require('socket.io')
const Message = require('../models/Message')
const Room = require('../models/Room')
const User = require('../models/User')
const {
	sendPushNotificationForMessage,
} = require('../services/message.service')
const {
	createAnInstance,
	deleteAnInstance,
} = require('../services/redis.service')

let io

function getIo() {
	return io
}

function initSocket(server) {
	io = socketIo(server)

	io.on('connection', async (socket) => {
		console.log('A user connected.', socket.id)
		console.log('A user connected:', socket.handshake.query.id)
		
		try {
			if (socket.handshake.query.id) {
				createAnInstance(
					`socket:${socket.handshake.query.id}`,
					socket.id
				)
				// check if id is valid as a ObjectId
				if (socket.handshake.query.id.match(/^[0-9a-fA-F]{24}$/))
					await User.updateOne(
						{ _id: socket.handshake.query.id },
						{ $set: { status: 'online' } }
					)
			}
		} catch (error) {
			console.log(error)
		}

		socket.on('join_room', (data) => {
			const { username, rooms } = data
			console.log(rooms)
			rooms.forEach((room) => {
				console.log(`${username} joined room ${room}`)
				socket.join(room)
			})
		})

		socket.on('check_online', (data) => {
			console.log('check_online')
			const { username } = data
			const isOnline = userOnline.includes(username)
			console.log(isOnline)
			io.to(socket.id).emit('check_online', { isOnline })
		})

		socket.on('test', (data) => {
			console.log('test')
		})

		socket.on('send_message', async (data) => {
			try {
				const { roomId, userId, message, nanoid, type } = data
				console.log('send_message', data)
				const messageData = {
					nanoid,
					roomId,
					content: message,
					sender: userId,
				}
				// save message to db
				if (type === 'text') {
					const _message = new Message({
						...messageData,
						reaction: [],
						seen_by: [],
						deleted_at: null,
					})
					await _message.save()
					await Room.updateOne(
						{ _id: message.roomId },
						{ $set: { last_message: message._id } }
					)
				}
				try {
					await sendPushNotificationForMessage({
						roomId,
						type,
						content: message,
						userId,
					}) // send push notification
				} catch (error) {
					console.log(error)
				}

				io.to(roomId).emit('receive_message', data)
			} catch (error) {
				console.log(error)
			}
		})

		socket.on('typing', (data) => {
			console.log('typing')
			const { roomId } = data
			io.to(roomId).emit('typing', data)
		})

		socket.on('stop_typing', (data) => {
			console.log('stop typing')
			const { roomId } = data
			io.to(roomId).emit('stop_typing', data)
		})

		socket.on('delete_message', (data) => {
			const { roomId } = data
			io.in(roomId).emit('recall_message', data)
		})
		socket.on('disconnect', async () => {
			try {
				deleteAnInstance(`socket:${socket.handshake.query.id}`)
				await User.updateOne(
					{ username: socket.handshake.query.username },
					{ $set: { status: 'offline', last_online: Date.now() } }
				)

				console.log('A user disconnected.')
			} catch (error) {
				console.log(error)
			}
		})
	})
}

module.exports = {
	initSocket,
	getIo,
}
