const Comment = require('../../models/Comment')
const File = require('../../models/File')
const Post = require('../../models/Post')
const {softDeletePost} = require('../../services/post.service')


class AdminPostController {
	async getPost(req, res) {
		try {
			const paginate = req.query

			const pageSize = Number(paginate.pageSize) || 10
			const offset = Number(paginate.offset) || 1

			const data = await Post.find()
				.populate({
					path: 'author',
					select: '_id username fullname avatarUrl',
				})
				.sort({ created_at: -1 })
				.skip((offset - 1) * pageSize)
				.limit(pageSize)
				.sort({ created_at: -1 })

			const totalPost = await Post.find().count()
			const totalPage = Math.ceil(totalPost / pageSize)

			return res
				.status(200)
				.json({ data: data, paginate: { offset, pageSize, totalPage } })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getPostDetail(req, res) {
		try {
			const data = await Post.findOne({ _id: req.params.id })
				.select('-__v')
				.populate({
					path: 'author',
					select: '_id username fullname avatarUrl',
				})
				.populate({
					path: 'attach_files',
					select: 'resource_type format url',
				})
				.populate({
					path: 'originPost',
					select: '-__v',
					populate: {
						path: 'attach_files',
					},
					populate: {
						path: 'author', 
						select: '_id username fullname avatarUrl'
					},
				})
				.populate({
					path: 'like_by',
					select: '-_id username',
				})

			const comment = await Comment.countDocuments({
				postId: req.params.id,
			})
			const metaData = { like: data.like_by.length, comment }
			return res.status(200).json({ data, metaData })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Server error' })
		}
	}

	async getUserLastPost(req, res) {
		try {
			const data = await Post.find({ author: req.query.userId })
				.populate({
					path: 'author',
					select: '-_id username fullname avatarUrl',
				})
				.sort({
					created_at: -1,
				})
				.limit(5)
			return res.status(200).json({ data: data })
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: 'Server error' })
		}
	}

	async softDelete(req, res) {
		try {
			const post = await Post.findById(req.params.id)
			if (post) {
				await softDeletePost(post._id)
			}
			else{
				return res.status(400).json({message: 'Post not exist'})
			}
			
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async recoverPost(req, res) {
		try {
			const post = await Post.findById(req.params.id)
			await Post.updateOne({ _id: req.params.id }, { deleted_at: null })
			await File.updateMany({_id: { $in: post.attach_files}}, {deleted_at: null})
			await Comment.updateMany({postId: req.params.id}, {deleted_at: null})
			return res.status(200).json({ message: 'Recover post successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async deletePost(req, res) {
		try {
			await Post.deleteOne({ _id: req.params.id })
			await Comment.deleteMany({ postId: req.params.id })
			return res
				.status(200)
				.json({ message: 'Delete post completely successful' })
		} catch (error) {
			res.status(500).json({ message: 'Server error' })
		}
	}
}

module.exports = new AdminPostController()
