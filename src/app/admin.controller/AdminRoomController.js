const Room = require('../../models/Room')
const Message = require('../../models/Message')

class AdminRoomController {
	async getRoom(req, res) {
		try {
			const paginate = req.query

			const pageSize = Number(paginate.pageSize) || 10
			const offset = Number(paginate.offset) || 1

			const rooms = await Room.find()
				.select('-__v -updated_at')
				.sort({ created_at: -1 })
				.populate({
					path: 'users',
					select: '_id username fullname avatarUrl',
				})
				.populate({
					path: 'created_by',
					select: '_id username fullname avatarUrl',
				})
				.skip((offset - 1) * pageSize)
				.limit(pageSize)

				const totalRoom = await Room.find().count()
				const totalPage = Math.ceil(totalRoom / pageSize)

			return res
				.status(200)
				.json({ data: rooms, paginate: { offset, pageSize, totalPage} })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getRoomDetail(req, res) {
		try {
			const data = await Room.findById(req.params.id)
				.populate({
					path: 'users',
					select: '_id username fullname avatarUrl',
				})
				.populate({
					path: 'created_by',
					select: '_id username fullname avatarUrl',
				})

			return res.status(200).json({ data: data })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async deleteRoom(req, res) {
		try {
			const response = await Room.updateOne({_id: req.params.id}, {deleted_at: Date.now()})
			// update deleted_at for all message in room
			console.log(response);
			return res.status(200).json({ message: 'Delete room successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async hardDeleteRoom(req, res) {
		try {
			await Room.deleteOne({_id: req.params.id})
			await Message.deleteMany({room_id: req.params.id})
			return res.status(200).json({ message: 'Delete room successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async recoverRoom(req, res) {
		try {
			await Room.updateOne({_id: req.params.id}, {deleted_at: null})
			return res.status(200).json({ message: 'Recover room successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}
}

module.exports = new AdminRoomController()
