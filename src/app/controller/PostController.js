const Post = require('../../models/Post')
const User = require('../../models/User')
const Comment = require('../../models/Comment')
const { addNewFile, unlinkAsync } = require('../../services/file.service')
const { default: mongoose, Mongoose } = require('mongoose')
const File = require('../../models/File')

class PostController {
	// get a post
	async getPost(req, res) {
		try {
			const _user = await User.findById(req.user.id)
			let post = await Post.getPostWithId(req.params.postId)
			post._doc.isLike = post.like_by.some( (element)=>  element.username === _user.username)
			// const comment = await Comment.find({postId: req.params.postId}).count()
			res.status(200).json({ data: post.toObject() })
		} catch (err) {
			console.log(err.message)
			res.status(500).json({ Error: "There's an error." })
		}
	}

	// search post
	async searchPost(req, res) {
		try {
			const searchText = req.query.search
			const filter = req.query.filter || 'new'
			const sort = () => {
				if(filter === 'new') return {created_at: -1}
				if(filter === 'hot') return {like_by: -1}
			}

			const currentUser = await User.findById(req.user.id)

			const post = await Post.find({ content: new RegExp(searchText, 'i'), deleted_at: null })
				.select('-__v -deleted_at')
				.populate({
					path: 'author',
					select: '-_id username fullname avatarUrl',
				})
				.populate({
					path: 'originPost',
					select: 'author content comments shared like attach_files scope like_by created_at',
					populate: {
						path: 'author',
						select: '-_id username fullname avatarUrl',
					},
					populate: {
						path: 'attach_files',
						select: 'resource_type format url',
					},
				})
				.populate({
					path: 'attach_files',
					select: 'resource_type format url',
				})
				.populate({
					path: 'like_by',
					select: '-_id username',
				})
				.sort(sort())

				let data = post.map((p) => {
					p._doc.totalLike = p.like_by.length
					p._doc.totalComment = p.comments.length
					p._doc.isLike = p.like_by.some(e => e.username === currentUser.username)
					return p.toObject()
				})

				
			// const comment = await Comment.find({postId: req.params.postId}).count()
			res.status(200).json({ data: data })
		} catch (err) {
			console.log(err)
			res.status(500).json({ Error: "There's an error." })
		}
	}

	async hotPost(req, res) {
		try {
			const paginateQuery = req.query

			const pageSize = Number(paginateQuery.pageSize) || 10
			const offset = Number(paginateQuery.offset) || 1

			const total = await Post.find({
				deleted_at: null,
				scope: 'public',
			}).count()
			const totalPost = total <= 100 ? total : 100
			const totalPage = Math.ceil(totalPost / pageSize)
			const paginate = { offset, pageSize, totalPage, totalPost }

			const currentUser = await User.findById(req.user.id)

			const _post = await Post.aggregate([
				{
					$match: {
						scope: 'public',
						deleted_at: null,
					},
				},
				{
					$project: {
						_id: 1,
						author: 1,
						content: 1,
						shared: 1,
						attach_files: 1,
						scope: 1,
						created_at: 1,
						like_by: 1,
						isLike: {
							$in: [
								mongoose.Types.ObjectId(req.user.id),
								'$like_by',
							],
						},
						totalLike: { $size: '$like_by' },
						totalComment: { $size: '$comments' },
					},
				},
				{ $sort: { totalLike: -1, created_at: -1 } },
				{ $skip: pageSize * (offset - 1) },
				{ $limit: pageSize },
			])

			let posts = _post.map((post) => {
				return new Post(post)
			})
			posts = await Post.populate(posts, {
				path: 'author',
				select: '-_id username fullname avatarUrl',
			})
			posts = await Post.populate(posts, {
				path: 'attach_files',
				select: 'resource_type format url',
			})
			posts = await Post.populate(posts, {
				path: 'like_by',
				select: '-_id username',
			})
			posts = posts.map((p, key) => {
				p._doc.totalLike = _post[key].totalLike
				p._doc.totalComment = _post[key].totalComment
				p._doc.isLike = _post[key].isLike
				return p
			})
			res.status(200).json({ data: posts, paginate })
		} catch (err) {
			console.log(err)
			res.status(500).json({ Error: "There's an error." })
		}
	}

	// Add a post
	async createPost(req, res) {
		try {
			let { content, scope } = req.body
			let attach_files = req.files

			if(!scope) scope = 'public'
			// check scope later
			if (!attach_files) {
				const post = new Post({
					content: content,
					scope: scope,
					author: req.user.id,
				})
				await post.save()
				return res.status(201).json({ message: 'Post successfully' })
			}
			let uploadData = []
			for (let i = 0; i < attach_files.length; i++) {
				const data = await addNewFile(
					attach_files[i].path,
					attach_files[i].mimetype.split('/')[0],
					attach_files[i].mimetype.split('/')[1],
					req.user.id,
					scope,
					true
				)
				uploadData.push(data._id.toString())
			}

			// delete temp file from server after upload
			for (let i = 0; i < attach_files.length; i++) {
				await unlinkAsync(attach_files[i].path)
			}

			attach_files = [...uploadData]

			const post = new Post({
				author: req.user.id,
				content,
				scope,
				attach_files,
			})
			await post.save()
			return res.status(201).json({ message: 'Add a post successful' })
		} catch (err) {
			console.log('Add Post: ', err)
			res.status(500).json({ message: 'Error' })
		}
	}

	async updatePost(req, res) {
		try {
			let { content, scope } = req.body
			const post = await Post.findById(req.params.id)
			if (post) {
				post.content = content
				post.scope = scope
				await post.save()

				return res
					.status(201)
					.json({ message: 'Update a post successful' })
			} else
				return res
					.status(400)
				.json({ message: 'Post is not existed to update' })
		} catch (error) {}
	}
	async sharePost(req, res) {
		try {
			let { content, scope, originPost } = req.body
			const isPostExisted = await Post.findById(originPost)
			if (isPostExisted) {
				const post = new Post({
					content,
					scope,
					originPost,
					author: req.user.id,
				})
				await post.save()
				await Post.updateOne(
					{ _id: originPost },
					{ $inc: { shared: 1 } }
				)
				return res
					.status(201)
					.json({ message: 'Share a post successful' })
			} else
				return res
					.status(400)
					.json({ message: 'Post is not existed to share' })
		} catch (error) {}
	}

	// delete a post
	async deletePost(req, res) {
		try {
			const post = await Post.findById(req.params.postId)

			if (req.user.id === post.author.toString()) {
				post.deleted_at = Date.now()
				await post.save()
				await File.updateMany({_id: { $in: post.attach_files}}, {deleted_at: Date.now()})
				return res
					.status(200)
					.json({ message: 'The post has been deleted' })
			}
			return res.status(401).json({ message: 'Not authorize' })
		} catch (err) {
			res.status(500).json({ Error: 'There a error' })
		}
	}

	// Like, unlike a post using put
	async likeOrUnlikePost(req, res) {
		try {
			const post = await Post.findById(req.params.postId)

			if (!post.like_by.includes(req.user.id) || post.like_by === []) {
				await post.updateOne({ $addToSet: { like_by: req.user.id } })
				return res
					.status(200)
					.json({ message: 'The post has been liked' })
			} else {
				await post.updateOne({ $pull: { like_by: req.user.id } })
				return res
					.status(200)
					.json({ message: 'The post has been unliked' })
			}
		} catch (err) {
			console.log('Like post: ', err.message)
			res.status(500).json({ message: 'Server error' })
		}
	}
	// get User all post
	async getPostByUserId(req, res) {
		try {
			const paginateQuery = req.query
			const currentUser = await User.findOne({
				username: req.params.username,
			})

			const pageSize = Number(paginateQuery.pageSize) || 10
			const offset = Number(paginateQuery.offset) || 1
			let _posts = await Post.getPostByAuthor(
				mongoose.Types.ObjectId(req.user.id),
				[currentUser._id],
				offset,
				pageSize
			)

			const totalPost = await Post.find({
				author: currentUser._id,
			}).count()
			const totalPage = Math.ceil(totalPost / pageSize)
			const paginate = { offset, pageSize, totalPage, totalPost }

			console.log(paginate)

			let posts = _posts.map((p) => new Post(p))
			posts = await Post.populate(posts, {
				path: 'author',
				select: '_id username fullname avatarUrl',
			})
			posts = await Post.populate(posts, {
				path: 'attach_files',
				select: 'resource_type format url',
			})
			posts = await Post.populate(posts, {
				path: 'like_by',
				select: '-_id username',
			})

			// add property to mongoose instance through _doc
			posts = posts.map((p, key) => {
				if (p._doc.like_by.includes(req.user.id)) p._doc.isLike = true
				else p._doc.isLike = false
				p._doc.totalLike = _posts[key].totalLike
				p._doc.totalComment = _posts[key].totalComment
				p._doc.isLike = _posts[key].isLike
				return p
			})

			res.status(200).json({ data: posts, paginate })
		} catch (error) {
			console.log(error)
			res.status(500).json({ Error: 'error' })
		}
	}

	// get post from user that current user is following and current user post
	async getTimelinePost(req, res) {
		try {
			const paginateQuery = req.query

			const pageSize = Number(paginateQuery.pageSize) || 10
			const offset = Number(paginateQuery.offset) || 1

			const currentUser = await User.findOne({
				username: req.params.username,
			})

			const _posts = await Post.getPostByAuthor(
				currentUser._id,
				currentUser.following.concat(currentUser._id),
				offset,
				pageSize
			)
			const totalPost = await Post.find({
				author: { $in: currentUser.following },
				deleted_at: null,
			}).count()
			const totalPage = Math.ceil(totalPost / pageSize)
			const paginate = { offset, pageSize, totalPage, totalPost }

			let posts = _posts.map((p) => new Post(p))
			posts = await Post.populate(posts, {
				path: 'author',
				select: '-_id username fullname avatarUrl',
			})
			posts = await Post.populate(posts, {
				path: 'attach_files',
				select: 'resource_type format url',
			})
			posts = await Post.populate(posts, {
				path: 'like_by',
				select: '-_id username',
			})

			// add property to mongoose instance through _doc
			posts = posts.map((p, key) => {
				p._doc.totalLike = _posts[key].like_by.length
				p._doc.totalComment = _posts[key].totalComment
				p._doc.isLike = _posts[key].isLike
				return p
			})

			res.status(200).json({ data: posts, paginate })
		} catch (error) {
			console.log(error)
			res.status(500).json({ Error: error })
		}
	}

	// get post from user that current user is following and current user post
	async getLikedPost(req, res) {
		try {
			const paginateQuery = req.query
			const _user = await User.findOne({username: req.query.username})
			const userId = _user ? _user.id : req.user.id

			const pageSize = Number(paginateQuery.pageSize) || 10
			const offset = Number(paginateQuery.offset) || 1

			let _posts = await Post.getLikeByPost(userId, req.user.id, offset, pageSize)

			const totalPost = await Post.find({
				like_by: userId,
				deleted_at: null,
			}).count()
			const totalPage = Math.ceil(totalPost / pageSize)
			const paginate = { offset, pageSize, totalPage, totalPost }

			let posts = _posts.map((p) => new Post(p))
			posts = await Post.populate(posts, {
				path: 'author',
				select: '-_id username fullname avatarUrl',
			})
			posts = await Post.populate(posts, {
				path: 'attach_files',
				select: 'resource_type format url',
			})
			posts = await Post.populate(posts, {
				path: 'like_by',
				select: '-_id username',
			})

			// add property to mongoose instance through _doc
			posts = posts.map((p, key) => {
				p._doc.totalLike = _posts[key].like_by.length
				p._doc.totalComment = _posts[key].like_by.length
				p._doc.isLike = _posts[key].isLike
				return p
			})

			res.status(200).json({ data: posts, paginate })
		} catch (error) {
			console.log(error)
			res.status(500).json({ Error: error })
		}
	}
}

module.exports = new PostController()
