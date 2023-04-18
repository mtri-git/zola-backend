const Notification = require('../models/Notification')

class NotificationService{

    async createNotification(notificationData){
        try {
            const notification = new Notification(notificationData)
            await notification.save()
            return notification
        } catch (error) {
            console.log(error)
            return null
        }
    }

    async readNotification(id){
        try {
            await Notification.findOneAndUpdate({_id: id}, {isRead: true})
        } catch (error) {
            console.log(error);
        }
    }

    async getAllNotification(receiver){
        try {
            const notification = await Notification.find({receiver: receiver}).populate('author', 'username avatarUrl').populate('postId', 'content')
            return notification
            
        } catch (error) {
            console.log(error);
            return null
        }
    }

}

module.exports = new NotificationService()