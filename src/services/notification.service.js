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

    async countUnreadNotification(receiver){
        try {
            return await Notification.countDocuments({receiver: receiver, isRead: false})
        } catch (error) {
            console.log(error);
        }
    }

    async readAllNotification(receiver){
        try {
            await Notification.updateMany({receiver: receiver}, {isRead: true})
        } catch (error) {
            console.log(error);
        }
    }

    async getAllNotification(receiver){
        try {
            const notification = await Notification.find({receiver: receiver})
            .populate('author', 'username avatarUrl').populate('postId', 'content')
            .sort({createdAt: -1})
            return notification
            
        } catch (error) {
            console.log(error);
            return null
        }
    }

    async countUnreadNotification(receiver){
        try {
            return await Notification.countDocuments({receiver: receiver, isRead: false})
        } catch (error) {
            console.log(error)
            return 0
        }
    }

    async deleteNotification(id){
        try {
            await Notification.deleteOne({_id: id})
        } catch (error) {
            console.log(error)
        }
    }

    async deleteAllNotification(receiver){
        try {
            await Notification.deleteMany({receiver: receiver})
        } catch (error) {
            console.log(error)
        }
    }


}

module.exports = new NotificationService()