const mongoose = require('mongoose')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const File = require('../../models/File')
const { softDeleteUser } = require('../../services/user.service')

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
				.sort({ created_date: -1 })
			const totalUser = await User.find().count()
			const totalPage = Math.ceil(totalUser / pageSize)

			return res.status(200).json({
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
					
				// delete all follow and following of user and like post of user
				await User.updateMany(
					{ $or: [{ follow: req.params.id }, { following: req.params.id }] },
					{ $pull: { follow: req.params.id, following: req.params.id } }
				)

				await Post.updateMany(
					{ like_by: req.params.id },
					{ $pull: { like_by: req.params.id } }
				)

				await Comment.updateMany(
					{ like_by: req.params.id },
					{ $pull: { like_by: req.params.id } }
				)

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
		const session = await mongoose.startSession()
		session.startTransaction()
		try {
			await User.deleteOne({ _id: req.params.id }).session(session)
			await Post.deleteMany({ author: req.params.id }).session(session)
			await Comment.deleteMany({ author: req.params.id }).session(session)
			await File.deleteMany({ owner: req.params.id }).session(session)
			await User.updateMany(
				{ $or: [{ follow: req.params.id }, { following: req.params.id }] },
				{ $pull: { follow: req.params.id, following: req.params.id } }
			)
			await Post.updateMany(
				{ like_by: req.params.id },
				{ $pull: { like_by: req.params.id } }
			)
			await Comment.updateMany(
				{ like_by: req.params.id },
				{ $pull: { like_by: req.params.id } }
			)
			await session.commitTransaction()
			return res.status(200).json({ message: 'Delete user successful' })
		} catch (error) {
			await session.abortTransaction()
			return res.status(500).json({ message: 'Server error' })
		} finally {
			session.endSession()
		}
	}
}

module.exports = new AdminUserController()
