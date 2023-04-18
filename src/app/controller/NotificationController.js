const NotificationService = require('../../services/notification.service')

class NotificationController {
    async getAllNotification(req, res) {
        try {
            const notifications = await NotificationService.getAllNotification(req.user.id)
            res.status(200).json({data: notifications})
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Error' })
        }
    }

    async readNotification(req, res) {
        try {
            await NotificationService.readNotification(req.params.id)
            res.status(200).json({message: 'Read notification successfully'})
        } catch (error) {
            console.log(error);
            res.status(500).json({message: 'Error'})
        }
    }
}

module.exports = new NotificationController()
