const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema({
	content: { type: String, default: ""},
	category_by_ai: String, // category by ai
	//default hastag = []
	hashtag: [String],
	mention: [String],
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	},
	originPost: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Post',
	},
	attach_files: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'File',
		},
	],
	files: [
		{
			type: String,
			url: String,
		}
	],
	scope: { type: String, default: 'public' },
	like_by: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
	],
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		},
	],
	shared: { type: Number, default: 0 },
	deleted_at: { type: Date, default: null, index: {expires: 604800} },
	created_at: {
		type: Date,
		default: Date.now,
	},
})


// remove all comment of post before remove post
PostSchema.pre('remove', async function (next) {
	await this.model('Comment').deleteMany({ post: this._id })
	next()
})

PostSchema.statics.getPostWithId = function (id) {
	return this.findOne({ _id: id, deleted_at: null })
		.select(
			'author content comments shared like attach_files scope like_by created_at'
		)
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
}

// let post like by
PostSchema.statics.getLikeByPost = function (userId, currentUser ,offset, pageSize) {
	return this.aggregate([
		{
			$match: {
				$expr: {
					$in: [mongoose.Types.ObjectId(userId), '$like_by'],
				},
				deleted_at: null,
			},
		},
		{
			$project: {
				_id: 1,
				author: 1,
				like: 1,
				content: 1,
				shared: 1,
				attach_files: 1,
				scope: 1,
				created_at: 1,
				isLike: { $in: [mongoose.Types.ObjectId(currentUser), '$like_by'] },
				like_by: { $slice: ['$like_by', 20] },
				totalLike: { $size: '$like_by' },
				totalComment: { $size: '$comments' },
			},
		},
		{ $sort: { created_at: -1} },
		{ $skip: pageSize * (offset - 1) },
		{ $limit: pageSize },
	])
}

// get post like user
// scope public later , scope: "public"
PostSchema.statics.getPostByAuthor = function (userId, userArray, offset = 1, pageSize = 10) {
	return this.aggregate([
		{
			$match: {
				$or: [
					{ scope: 'public' },
					{ 
						scope: 'friend', 
						$and: [
							{ follower: userId },
							{ following: userId }
						]
					}
				],
				author: {$in: userArray},
				deleted_at: null,
			},
		},
		{
			$project: {
				_id: 1,
				author: 1,
				content: 1,
				like: 1,
				shared: 1,
				attach_files: 1,
				scope: 1,
				created_at: 1,
				like_by: 1,
				isLike: { $in: [userId, '$like_by'] },
				totalLike: { $size: '$like_by' },
				totalComment: { $size: '$comments' },
			},
		},
		{ $sort: { created_at: -1, totalLike: -1 } },
		{ $skip: pageSize * (offset - 1) },
		{ $limit: pageSize },
	])
}

PostSchema.pre('save', function (next) {
	this.updated_at = Date.now()
	next()
})

const Post = mongoose.model('Post', PostSchema)
module.exports = Post
