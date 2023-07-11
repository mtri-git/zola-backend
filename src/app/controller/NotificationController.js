const NotificationService = require('../../services/notification.service')
const Device = require('../../models/Device')
const {
	sendPushNotification,
	sendCallToMobile,
} = require('../../services/firebase.service')
const { getIo } = require('../../configs/socket.config')

const admin = require('firebase-admin')

var serviceAccount = require('../../configs/firebase/zola-firebase-firebase-adminsdk-rjq2h-87c2c684f4.json')
const Room = require('../../models/Room')

const init = () => {
	admin.initializeApp({
		credential: admin.credential.cert(serviceAccount),
	})
}

class NotificationController {
	async getAllNotification(req, res) {
		try {
			const { page = 1, limit = 10, filter = 'all' } = req.query

			const { notifications, pages, total } =
				await NotificationService.getAllNotification(
					req.user.id,
					page,
					limit,
					filter
				)

			const pagination = {
				total,
				limit,
				page,
				pages,
			}

			res.status(200).json({ data: notifications, pagination })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Error' })
		}
	}

	async countUnreadNotification(req, res) {
		try {
			const count = await NotificationService.countUnreadNotification(
				req.user.id
			)
			return res.status(200).json({ data: count })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Error' })
		}
	}

	async getUnreadNotification(req, res) {
		try {
			const count = await NotificationService.countUnreadNotification(
				req.user.id
			)
			res.status(200).json({ data: count })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Error' })
		}
	}

	async readNotification(req, res) {
		try {
			await NotificationService.readNotification(req.params.id)
			res.status(200).json({ message: 'Read notification successfully' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Error' })
		}
	}

	async deleteNotification(req, res) {
		try {
			await NotificationService.deleteNotification(req.params.id)
			return res
				.status(200)
				.json({ message: 'Delete notification successfully' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Error' })
		}
	}

	async deleteAllNotification(req, res) {
		try {
			await NotificationService.deleteAllNotification(req.user.id)
			return res
				.status(200)
				.json({ message: 'Delete all notification successfully' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Error' })
		}
	}

	async readAllNotification(req, res) {
		try {
			await NotificationService.readAllNotification(req.user.id)
			return res
				.status(200)
				.json({ message: 'Read all notification successfully' })
		} catch (error) {
			return res.status(500).json({ message: 'Error' })
		}
	}

	async startVideoCallFromMobile(req, res) {
		try {
			const userId = req.user.id
			const roomId = req.params.id
			const room = await Room.findById(roomId)
			if (!room)
				return res.status(404).json({ message: 'Room not found' })
			const userToCall = room.users.filter((user) => user != userId)[0]
			const devices = await Device.find({ owner: userToCall })
			const tokens = devices.map((device) => device.fcm_token)

			if (tokens.length === 0)
				return res.status(200).json({ message: 'User not found' })

			const token = await sendCallToMobile({ userId, tokens, roomId })

			return res.status(200).json(token)
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Error' })
		}
	}

	 testIo(req, res) {
		try {
			const io = getIo()
			io.to(req.body.id).emit('new_notification', { message: req.body.message })

			return res.status(200).json({ message: 'OK' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Error' })
		}
	}

	async testNotificationFirebase(req, res) {
		try {
			await admin.messaging().sendMulticast({
				tokens: [
					'dV04mucSTSiu_wF6kCjbwo:APA91bH1TCftVlDRz97z2C4mBn3TQb6h9QQKaqbNgQcwJbjzH_99HXqmaPODjDrXBFq8sICNptGyExoxfF2JM4qjc0EnqHclj7FM9KKmY3cXItG3BxHKg5tHzi9WrIEhhJ3Zfd202eUP',
				],
				// notification: {
				// 	title: 'Urgent action needed!',
				// 	body: 'Urgent action is needed to prevent your account from being disabled!'
				//   },
				data: {
					sound: 'default',
					type: 'call',
					fullname: 'Vo Minh Tri',
					avatar: 'https://i.pravatar.cc/300',
					token: '0060eab3e12158840c8b14539c108f770f6IABYLOFd0Dg2g3IyNR5iT66MkuDqWIXTIQBJytpIqfFR84p+KioNvtUaEABbbnUAZ4NPZAEAAQD3P05k',
					roomName: 'flutter',
				},
				options: {
					priority: 'high',
					timeToLive: 60 * 60 * 24,
				},
			})

			return res.status(200).json({ message: 'Success' })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: error })
		}
	}
}

module.exports = new NotificationController()
