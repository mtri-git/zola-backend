const socketIo = require('socket.io')
const Message = require('../models/Message')
const Room = require('../models/Room')
const User = require('../models/User')
const {
	sendPushNotificationForMessage,
} = require('../services/message.service')

let io

let userOnline = []

function getIo() {
	return io
}

function initSocket(server) {
	io = socketIo(server)

	io.on('connection', async (socket) => {
		console.log('A user connected.')
		console.log('A user connected:', socket.handshake.query.username)
		try {
			if (socket.handshake.query.username) {
				userOnline.push(socket.handshake.query.username)
				await User.updateOne(
					{ username: socket.handshake.query.username },
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
				await sendPushNotificationForMessage({
					roomId,
					type,
					content: message,
					userId,
				}) // send push notification

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
				delete userOnline[socket.handshake.query.username]
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
