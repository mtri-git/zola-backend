const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const User = require('../../models/User')
const { post } = require('../../routers/common.routes/comment.route')

class CommentController {
	// get a comment

	async getComment(req, res) {
		try {

			const commentPromise = Comment.findOne({
				_id: req.params.commentId,
				deleted_at: null,
			  });
			  const replyCountPromise = Comment.find({reply_to: req.params.commentId}).count();
			  
			  const [comment, replyCount] = await Promise.all([commentPromise, replyCountPromise]);

			const commentRes = {
				...comment._doc,
				meta_data: {
					reply_count: replyCount,
					like_count: comment.like_by.length
				}
			}


			res.status(200).json({ comment: commentRes })
		} catch (err) {
			console.log(err);
			res.status(500).json({ Error: 'Server error.' })
		}
	}

	// Add a comment
	async createComment(req, res) {
		try {
			const { postId, content, reply_to, parent_id } = req.body
			const isExistPost = await Post.exists({ _id: postId })

			if (!content) {
				return res.status(400).json({ message: 'Content is required' })
			}

			if( !reply_to ^ !parent_id ){ 
				//XOR if reply_to is null then parent_id is not null is not valid
				// if both are null or both are not null is valid for a comment (parent comment or reply comment)
				return res.status(400).json({ message: 'reply_to and parent_id are required' })
			}

			if (isExistPost) {
				const comment = new Comment({
					postId,
					content,
					reply_to,
					parent_id,
					author: req.user.id,
				})
				await comment.save()
				await Post.updateOne(
					{ _id: postId },
					{ $addToSet: { comments: comment._id } }
				)

				return res
					.status(201)
					.json({ message: 'Add a comment successful' })
			}
			return res.status(404).json({ message: 'Post is not existed' })
		} catch (err) {
			console.log('comment: ', err.message)
			res.status(500).json({ message: 'Server error' })
		}
	}

	// delete a comment
	async deleteComment(req, res) {
		try {
			const comment = await Comment.findById(req.params.commentId)
			if (comment.deleted_at)
				return res
					.status(400)
					.json({ message: 'This comment has already been deleted' })
			if (comment.author.toString() !== req.user.id) {
				return res
					.status(401)
					.json({ message: 'Not authorize for this' })
			}
			comment.deleted_at = Date.now()
			const resp = await Post.updateOne(
				{ _id: comment.postId },
				{ $pull: { comments: comment._id } }
			)
			console.log(resp)
			comment.save()
			res.status(200).json({ message: 'The comment has been deleted' })
		} catch (err) {
			console.log('Error: ', err)
			res.status(500).json({ Error: 'There a error' })
		}
	}

	// Like, unlike a comment using put
	async likeOrUnlikeComment(req, res) {
		try {
			const comment = await Comment.findById(req.params.commentId)
			if (!comment.like_by.includes(req.user.id)) {
				await comment.updateOne({ $push: { like_by: req.user.id } })
				res.status(200).json({ message: 'The comment has been liked' })
			} else {
				await comment.updateOne({ $pull: { like_by: req.user.id } })
				res.status(200).json({
					message: 'The comment has been unliked',
				})
			}
		} catch (err) {
			console.log('Error: ', err.message)
			res.status(500).json({ message: 'Server Error' })
		}
	}

	// get User all post
	async getCommentByPostId(req, res) {
		try {
			const currentPost = await Post.findOne({
				_id: req.params.postId,
				deleted_at: null,
			})
			if (currentPost) {
				let data = await Comment.find({
					postId: currentPost._id,
					deleted_at: null,
					reply_to: null,
				})
					.populate({ path: 'author', select: 'username fullname avatarUrl' })
					.populate({ path: 'reply_to' })
					.select('author postId reply_to content like_by created_at')

				for (let index = 0; index < data.length; index++) {
					data[index]._doc.totalReply = await Comment.find({
						reply_to: data[index]._id,
					}).count()
					data[index]._doc.totalLike = data[index].like_by.length
					data[index]._doc.isLike = data[index].like_by.includes(
						req.user.id
					)
				}

				res.status(200).json({ data })
			} else return res.status(400).json({ message: 'Post not exist' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ Error: 'error' })
		}
	}

	async getReplyComment(req, res) {
		try {
			const currentComment = await Comment.findOne({
				_id: req.params.id,
				deleted_at: null,
			})
			if (currentComment) {
				let data = await Comment.find({
					reply_to: currentComment._id,
					deleted_at: null,
				})
					.populate({ path: 'author', select: 'username fullname avatarUrl' })
					// .populate({ path: 'reply_to' })
					.select('author postId reply_to parent_id content like_by created_at')

				for (let index = 0; index < data.length; index++) {
					data[index]._doc.totalReply = await Comment.find({
						reply_to: data[index]._id,
					}).count()
					data[index]._doc.totalLike = data[index].like_by.length
					data[index]._doc.isLike = data[index].like_by.includes(
						req.user.id
					)
				}

				res.status(200).json({ data })
			} else
				return res.status(400).json({ message: 'Comments not exist' })
		} catch (error) {
			console.log(error)
			res.status(500).json({ Error: 'error' })
		}
	}

	// get all comment by userId
	async getAllCommentByUserId(req, res) {
		try {
			const currentUser = await User.findOne({
				_id: req.user.id,
				deleted_at: null,
			})
			if (!currentUser)
				return res.status(404).json({ message: 'Not found' })
			console.log(req.user.id)
			let data = await Comment.find({
				author: req.user.id,
				deleted_at: null,
			})
				.populate({ path: 'author', select: 'username fullname avatarUrl' })
				.select('author postId content like_by created_at')

			for (let index = 0; index < data.length; index++) {
				data[index]._doc.totalReply = await Comment.find({
					reply_to: data[index]._id,
				}).count()
				data[index]._doc.totalLike = data[index].like_by.length
				data[index]._doc.isLike = data[index].like_by.includes(
					req.user.id
				)
			}
			return res.status(200).json({ data })
		} catch (error) {
			console.log('Get message by user: ', error)
			return res.status(500).json({ Error: 'Server error' })
		}
	}

	async getAllCommentByUsername(req, res) {
		try {
			const currentUser = await User.findOne({
				username: req.params.username,
				deleted_at: null,
			})
			if (!currentUser)
				return res.status(404).json({ message: 'Not found' })

			let data = await Comment.find({
				author: currentUser._id,
				deleted_at: null,
			})
				.populate({ path: 'author', select: 'username fullname avatarUrl' })
				.select('author postId content like_by created_at')

			for (let index = 0; index < data.length; index++) {
				data[index]._doc.totalReply = await Comment.find({
					reply_to: data[index]._id,
				}).count()
				data[index]._doc.totalLike = data[index].like_by.length
				data[index]._doc.isLike = data[index].like_by.includes(
					req.user.id
				)
			}

			return res.status(200).json({ data })
		} catch (error) {
			console.log('Get message by user: ', error)
			return res.status(500).json({ Error: 'Server error' })
		}
	}
}

module.exports = new CommentController()
