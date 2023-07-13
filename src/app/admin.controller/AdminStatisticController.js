const mongoose = require('mongoose')
const Message = require('../../models/Message')
const Comment = require('../../models/Comment')
const Post = require('../../models/Post')
const Room = require('../../models/Room')
const User = require('../../models/User')
const moment = require('moment')

const transform = (data, dataTmp) => {
	data.forEach((item) => {
	  dataTmp.forEach((i) => {
		if (i.name === item.name) {
		  i.Total = item.Total;
		  return;
		}
	  });
	});
  
	return dataTmp;
  };

class AdminStatisticController {
	async getStatisticNumber(req, res) {
		try {
			const userNumber = await User.find().count()
			const postNumber = await Post.find().count()
			const chatNumber = await Message.find().count()
			const roomNumber = await Room.find().count()
			const commentNumber = await Comment.find().count()

			return res.status(200).json({
				data: {
					userNumber,
					postNumber,
					chatNumber,
					roomNumber,
					commentNumber,
				},
			})
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getUserJoinByMonth(req, res) {
		try {
			const today = new Date(Date.now())
			
			const lastMonth = []

			for (let i = 0; i < 6; i++) {
				const date = moment(today).subtract(i, 'M')
				lastMonth.push({name: `${date.month()+1}/${date.year()}`, Total: 0})
			}


			let queries = await User.aggregate([
				{ $match: { created_date: { $gte: new Date(moment().subtract(5, 'months')), $lt: new Date(Date.now()) } } },
				{
					$group: {
						_id: {
							month: { $month: '$created_date' },
							year: { $year: '$created_date' },
						},
						Total: { $sum: 1 },
					},
				},
			]).sort({ _id: 1 })

			let data = queries.map(q => {
				q.name = `${q._id.month}/${q._id.year}`
				delete q._id
				return q
			})
			data = transform(data, lastMonth).reverse()

			return res.status(200).json({ data: data })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Server error' })
		}
	}
	async getPostByMouth(req, res) {
		try {
			const today = new Date(Date.now())
			
			const lastMonth = []

			for (let i = 0; i < 6; i++) {
				const date = moment(today).subtract(i, 'M')
				lastMonth.push({name: `${date.month()+1}/${date.year()}`, Total: 0})
			}


			let queries = await Post.aggregate([
				{ $match: { created_at: { $gte: new Date(moment().subtract(5, 'months')), $lt: new Date(Date.now()) } } },
				{
					$group: {
						_id: {
							month: { $month: '$created_at' },
							year: { $year: '$created_at' },
						},
						Total: { $sum: 1 },
					},
				},
			]).sort({ _id: 1 })

			let data = queries.map(q => {
				q.name = `${q._id.month}/${q._id.year}`
				delete q._id
				return q
			})
			data = transform(data, lastMonth).reverse()

			return res.status(200).json({ data: data })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getUserByAge(req, res) {
		try {
			const teen = await User.find({
				birthday: {
					$gte: moment().subtract(15, 'years'),
					$lte: moment().subtract(0, 'years'),
				},
			}).count()
			const youth = await User.find({
				birthday: {
					$gte: moment().subtract(29, 'years'),
					$lte: moment().subtract(15, 'years'),
				},
			}).count()

			const middleAge = await User.find({
				birthday: {
					$gte: moment().subtract(60, 'years'),
					$lte: moment().subtract(29, 'years'),
				},
			}).count()

			const old = await User.find({
				birthday: {
					$lte: moment().subtract(60, 'years'),
				},
			}).count()

			const total = await User.find().count()
			return res.status(200).json({
				data: [
					{ name: '0-15', value: teen },
					{ name: '15-29', value: youth },
					{ name: '29-60', value: middleAge },
					{ name: '60+', value: old },
				],
			})
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getUserChatByMonth(req, res) {
		try {
			const lastMonth = []
			const today = new Date(Date.now())
			for (let i = 0; i < 6; i++) {
				const date = moment(today).subtract(i, 'M')
				lastMonth.push({name: `${date.month()+1}/${date.year()}`, Total: 0})
			}
			
			let queries = await Message.aggregate([
				{
					$match: {
						sender: mongoose.Types.ObjectId(req.params.id),
						created_at: { $gte: new Date(moment().subtract(5, 'months')), $lt: new Date(Date.now()) },
					},
				},
				{
					$group: {
						_id: {
							month: { $month: '$created_at' },
							year: { $year: '$created_at' },
						},
						Total: { $sum: 1 },
					},
				},
			]).sort({ _id: 1 })

			
			let data = queries.map(q => {
				q.name = `${q._id.month}/${q._id.year}`
				delete q._id
				return q
			})
			

			data = transform(data, lastMonth).reverse()

			return res.status(200).json({ data })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getRoomChatByMonth(req, res) {
		try {
			const lastMonth = []
			const today = new Date(Date.now())
			for (let i = 0; i < 6; i++) {
				const date = moment(today).subtract(i, 'M')
				lastMonth.push({name: `${date.month()+1}/${date.year()}`, Total: 0})
			}
			
			let queries = await Message.aggregate([
				{
					$match: {
						roomId: mongoose.Types.ObjectId(req.params.id),
						created_at: { $gte: new Date(moment().subtract(5, 'months')), $lt: new Date(Date.now()) },
					},
				},
				{
					$group: {
						_id: {
							month: { $month: '$created_at' },
							year: { $year: '$created_at' },
						},
						Total: { $sum: 1 },
					},
				},
			]).sort({ _id: 1 })

			let data = queries.map(q => {
				q.name = `${q._id.month}/${q._id.year}`
				delete q._id
				return q
			})

			data = transform(data, lastMonth).reverse()

			return res.status(200).json({ data })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Server error' })
		}
	}
}

module.exports = new AdminStatisticController()
