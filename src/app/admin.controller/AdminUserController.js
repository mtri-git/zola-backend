const User = require('../../models/User')
const { addNewFile, unlinkAsync } = require('../../services/file.service')

class AdminUserController {
	async getUser(req, res) {
		try {
			const paginate = req.query

			const pageSize = Number(paginate.pageSize) || 10
			const offset = Number(paginate.offset) || 1

			const users = await User.find()
				.select('-password')
				.skip((offset - 1) * pageSize)
				.limit(pageSize)
			const totalUser = await User.find().count()
			const totalPage = Math.ceil(totalUser / pageSize)

			return res
				.status(200)
				.json({
					data: users,
					paginate: { offset, pageSize, totalPage },
				})
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getUserDetail(req, res) {
		try {
			const data = await User.findById(req.params.id).select('-password')

			return res.status(200).json({ data: data })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async createUser(req, res) {
		try {
			return res.status(200).json({ message: 'Create user successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async updateUser(req, res) {
		try {
			return res.status(200).json({ message: 'update user successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async softDeleteUser(req, res) {
		try {
			if (await User.exists({ _id: req.params.id })) {
				const response = await User.updateOne(
					{ _id: req.params.id },
					{ deleted_at: Date.now() }
				)
				console.log(response.matchedCount)
				if (response.matchedCount)
					return res
						.status(200)
						.json({ message: 'Delete user successful' })
				return res.status(300).json({ message: 'Nothing happen' })
			} else {
				res.status(400).json({ message: 'Delete user fail' })
			}
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async recoverUser(req, res) {
		try {
			if (await User.exists({ _id: req.params.id })) {
				await User.updateOne(
					{ _id: req.params.id },
					{ deleted_at: null }
				)

				return res
					.status(200)
					.json({ message: 'Delete user successful' })
			} else {
				res.status(400).json({ message: 'Delete user fail' })
			}
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async deleteUser(req, res) {
		try {
			await User.deleteOne({ _id: req.params.id })
			return res.status(200).json({ message: 'Create user successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}
}

module.exports = new AdminUserController()
