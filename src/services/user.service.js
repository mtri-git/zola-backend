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
			Post.updateMany({
				author: user._id,
			}),
            Comment.updateMany({
                author: user._id,
            }),
            File.updateMany({
                owner: user._id,}),
		])
		return user
	} catch (error) {
		console.log('Error: ', error)
		throw error
	}
}

const hardDeleteUser = async (userId) => {
    const user = await User.findByIdAndDelete(userId)
    await Promise.all([
        Post.deleteMany({
            author: user._id,}),
        Comment.deleteMany({
            author: user._id,}),
        File.deleteMany({
            owner: user._id,}),
    ])
}

module.exports = {hardDeleteUser, softDeleteUser}
