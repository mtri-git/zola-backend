const File = require('../../models/File')
const Post = require('../../models/Post')
const User = require('../../models/User')

class FileController {
	async getFile(req, res) {
		try {
			const files = await File.find({
				owner: req.user.id,
				isFromPost: true,
				deleted_at: null,
			})
			res.status(200).json({ data: files })
		} catch (err) {
			res.status(500).json({ message: 'Server error.' })
		}
	}

	async getFilePublic(req, res) {
		try {
			const user = await User.findOne({username: req.params.username})
			if(!user)
				return  res.status(400).json({ message: 'User is not existed' })

			const files = await File.find({
				owner: user._id,
				isFromPost: true,
				deleted_at: null,
				$or: [
					{isPrivate: false},
					{isPrivate: null},
				]
			})
			res.status(200).json({ data: files })
		} catch (err) {
			res.status(500).json({ message: 'Server error.' })
		}
	}

	async getPostByFile(req, res) {
		try {
			const post = await Post.findOne({ attach_files: req.params.fileId })
				.select(
					'author content comments shared attach_files scope like_by created_at'
				)
				.populate({
					path: 'author',
					select: 'username fullname avatarUrl',
				})
				.populate({
					path: 'attach_files',
					select: 'resource_type format url',
				})
				.populate({
					path: 'like_by',
					select: '-_id username',
				})
				.lean()
			if (post) {
				const like = post.like_by.length
				const comment = post.comments.length
				return res.status(200).json({
					data: post,
					metadata: { like, comment },
				})
			}
			return res.status(404).json({
				message: 'Not found'
			})
		} catch (err) {
			console.log(err)
			res.status(500).json({ message: 'Server error.' })
		}
	}
}

module.exports = new FileController()
