const Room = require('../models/Room')
const Device = require('../models/Device')
const User = require('../models/User')
const { sendPushNotification } = require('./firebase.service')

const sendPushNotificationForMessage = async ({roomId, type, content, userId}) => {
	const room = await Room.findOne({ _id: roomId })
    //get user device exept sender
	const device = await Device.find().where('owner').in(room.users).ne('owner', userId)
	const tokens = device.map((d) => d.fcm_token)

	const user = await User.findOne({ _id: userId })

	let messageContent = content

	switch (type) {
		case 'text':
			messageContent =
			content.length > 20
					? content.slice(0, 20) + '...'
					: content
			break
		case 'image':
			messageContent = 'Đã gửi ảnh 📷'
			break
		case 'video':
			messageContent = 'Đã gửi video 📽️'
		case 'audio':
			messageContent = 'Đã gửi audio 🎵'
		case 'file':
			messageContent = 'Đã gửi file 📁'
		default:
			break
	}

	await sendPushNotification({
		tokens,
		title: `${user.fullname} đã nhắn tin`,
		body: messageContent,
		id: roomId,
		type: 'message',
	})
}

module.exports = { sendPushNotificationForMessage }
