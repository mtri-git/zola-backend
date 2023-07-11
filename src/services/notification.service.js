const Notification = require('../models/Notification')
const { getIo } = require('../configs/socket.config')
const { getAnInstance } = require('../services/redis.service')

class NotificationService {
	constructor() {
		this.io = getIo()
	}

	async createNotification({ message, receiver, author, type, postId }) {
		try {
			const notification = new Notification({
				message,
				receiver,
				author,
				type,
				postId,
			})
			await notification.save()
			const socketId = await getAnInstance(`socket:${receiver}`)
			if (socketId) {
				this.io.to(socketId).emit('new_notification', notification)
			}
			return notification
		} catch (error) {
			console.log(error)
			return null
		}
	}

	async readNotification(id) {
		try {
			await Notification.findOneAndUpdate({ _id: id }, { isRead: true })
		} catch (error) {
			console.log(error)
		}
	}

	async countUnreadNotification(receiver) {
		try {
			return await Notification.countDocuments({
				receiver: receiver,
				isRead: false,
			})
		} catch (error) {
			console.log(error)
		}
	}

	async readAllNotification(receiver) {
		try {
			await Notification.updateMany(
				{ receiver: receiver },
				{ isRead: true }
			)
		} catch (error) {
			console.log(error)
		}
	}

	async getAllNotification(receiver, page, limit, filter) {
		try {
			// filter is all, unread, read

			const notifications = await Notification.find({
				receiver: receiver,
				isRead:
					filter === 'all'
						? { $in: [true, false] }
						: filter === 'read'
						? true
						: false,
			})
				.populate('author', 'username avatarUrl')
				.populate('postId', 'content')
				.sort({ createdAt: -1 })
				.limit(limit)
				.skip((page - 1) * limit)

			const totalNotification = await Notification.countDocuments({
				receiver: receiver,
			})

			return {
				notifications,
				pages: Math.ceil(totalNotification / limit),
				total: totalNotification,
			}
		} catch (error) {
			console.log(error)
			return null
		}
	}

	async countUnreadNotification(receiver) {
		try {
			return await Notification.countDocuments({
				receiver: receiver,
				isRead: false,
			})
		} catch (error) {
			console.log(error)
			return 0
		}
	}

	async deleteNotification(id) {
		try {
			await Notification.deleteOne({ _id: id })
		} catch (error) {
			console.log(error)
		}
	}

	async deleteAllNotification(receiver) {
		try {
			await Notification.deleteMany({ receiver: receiver })
		} catch (error) {
			console.log(error)
		}
	}
}

module.exports = new NotificationService()
