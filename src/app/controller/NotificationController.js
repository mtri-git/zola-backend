const NotificationService = require('../../services/notification.service')
const { sendPushNotification } = require('../../services/firebase.service')
const { getIo } = require('../../configs/socket2.config')

class NotificationController {
	async getAllNotification(req, res) {
		try {
			const notifications = await NotificationService.getAllNotification(
				req.user.id
			)
			res.status(200).json({ data: notifications })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Error' })
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
            return res.status(200).json({message: "Delete notification successfully"})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: "Error"})
        }
    }

    async deleteAllNotification(req, res) {
        try {
            await NotificationService.deleteAllNotification(req.user.id)
            return res.status(200).json({message: "Delete all notification successfully"})
        } catch (error) {
            console.log(error)
            return res.status(500).json({message: "Error"})
        }
    }

    async readAllNotification(req, res) {
        try {
            await NotificationService.readAllNotification(req.user.id)
            return res.status(200).json({message: "Read all notification successfully"})
        } catch (error) {
            return res.status(500).json({message: "Error"})
        }
    }

	async testNotificationFirebase(req, res) {
		try {
			await sendPushNotification({
				tokens: [
					'dV04mucSTSiu_wF6kCjbwo:APA91bH1TCftVlDRz97z2C4mBn3TQb6h9QQKaqbNgQcwJbjzH_99HXqmaPODjDrXBFq8sICNptGyExoxfF2JM4qjc0EnqHclj7FM9KKmY3cXItG3BxHKg5tHzi9WrIEhhJ3Zfd202eUP',
                    'euA7ZgzVC3gCUW-l2Fbclq:APA91bEW64BOiVUphlovZpTOo8WMIPmcn3a_K7h7NhmZ5OLcl66f5rrJHa9zLzEl1JxPFSNyLjAynDqBPEggVSnkz4y_WffGiaXa8CCwFpvWLytwUFDXk_3maL592OJ0lFVRSoiAnXBi'
				],
				title: 'Push noti!',
				body: 'A new weather warning has been issued for your location.',
				imageUrl: 'https://picsum.photos/200',
			})

			return res.status(200).json({ message: 'Success' })
		} catch (error) {
			return res.status(500).json({ message: error })
		}
	}
	
}

module.exports = new NotificationController()
