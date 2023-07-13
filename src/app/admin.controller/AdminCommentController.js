const Comment = require('../../models/Comment')
const Post = require('../../models/Post')

class AdminCommentController {
	async getComment(req, res) {
		try {
			const paginate = req.query

			const pageSize = Number(paginate.pageSize) || 10
			const offset = Number(paginate.offset) || 1

			const data = await Comment.find()
				.populate({ path: 'author', select: 'username avatarUrl' })
				.sort({created_at: -1})
				.skip((offset - 1) * pageSize)
				.limit(pageSize)
			const totalPost = await Comment.find().count()
			const totalPage = Math.ceil(totalPost / pageSize)

			return res
				.status(200)
				.json({ data: data, paginate: { offset, pageSize, totalPage } })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async softDelete(req, res) {
		try {
			await Comment.updateOne(
				{ _id: req.params.id },
				{ deleted_at: Date.now() }
			)

			// soft delete reply comment
			await Comment.updateMany(
				{ parent_id: req.params.id },
				{ deleted_at: Date.now() }
			)
			return res
				.status(200)
				.json({ message: 'Delete Comment successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async recoverComment(req, res) {
		try {
			await Comment.updateOne(
				{ _id: req.params.id },
				{ deleted_at: null }
			)
			return res
				.status(200)
				.json({ message: 'Recover Comment successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async deleteComment(req, res) {
		try {
			const comment = await Comment.findOne({ _id: req.params.id })
			if (comment) {
				await Comment.deleteOne({ _id: req.params.id })
				await Comment.deleteMany({ parent_id: req.params.id })
				await Post.updateOne({_id: comment.postId}, {$pull: {comment: req.params.id} })
				return res
					.status(200)
					.json({ message: 'Delete Comment completely successful' })
			}
			return res.status(400).json({message: 'Comment not existed'})
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}
}

module.exports = new AdminCommentController()
