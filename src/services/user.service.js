const User = require('../models/User')
const Comment = require('../models/Comment')
const Post = require('../models/Post')
const File = require('../models/File')

const softDeleteUser = async (userId) => {
	try {
		const user = await User.findByIdAndUpdate(userId, {
			deleted_at: Date.now(),
		})
		await Promise.all([
			Post.updateMany(
				{ author: user._id },
				{ $set: { deleted_at: Date.now() } }
			),
			Comment.updateMany(
				{ author: user._id },
				{ $set: { deleted_at: Date.now() } }
			),
			File.updateMany(
				{ owner: user._id },
				{ $set: { deleted_at: Date.now() } }
			),
			// delete follower and following
			User.updateMany(
				{ $or: [{ follow: user._id }, { following: user._id }] },
				{ $pull: { follow: user._id, following: user._id } }
			),
			// delete like post
			Post.updateMany(
				{ like_by: user._id },
				{ $pull: { like_by: user._id } }
			),
			// delete like comment
			Comment.updateMany(
				{ like_by: user._id },
				{ $pull: { like_by: user._id } }
			),
		])

		return user
	} catch (error) {
		console.log('Error: ', error)
		return null
	}
}

const hardDeleteUser = async (userId) => {
	try {
		const user = await User.findByIdAndDelete(userId)
		await Promise.all([
			Post.deleteMany({
				author: user._id,
			}),
			Comment.deleteMany({
				author: user._id,
			}),
			File.deleteMany({
				owner: user._id,
			}),
		])
	} catch (error) {
        console.log('Error: ', error)
        return null
    }
}

module.exports = { hardDeleteUser, softDeleteUser }
