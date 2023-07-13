const mongoose = require('mongoose')
const User = require('../../models/User')
const Post = require('../../models/Post')
const Comment = require('../../models/Comment')
const { addNewFile, unlinkAsync } = require('../../services/file.service')
const { formatDate } = require('../../utils/format')

class UserController {
	async getInfo(req, res) {
		try {
			const user = await User.findById(req.user.id).select(
				'-password -devices'
			)
			res.status(200).json({ data: user })
		} catch (err) {
			res.status(500).json({ error: "There's an error" })
		}
	}

	async searchUser(req, res) {
		try {
			const query = req.query
			const users = await User.find({
				$or: [
					{
						$text: { $search: query.search },
						deleted_at: null,
						_id: { $ne: req.user.id },
					},
					{
						username: { $regex: query.search, $options: 'i' },
						deleted_at: null,
						_id: { $ne: req.user.id },
					},
					{
						fullname: { $regex: query.search, $options: 'i' },
						deleted_at: null,
						_id: { $ne: req.user.id },
					},
				],
			}).select(
				'-password -devices -deleted_at -not_notification -blocked_users'
			)

			const data = users.map((user) => {
				user._doc.isFollowing = user.follower.includes(req.user.id)
				user._doc.isFriend =
					user.following.includes(req.user.id) &&
					user.follower.includes(req.user.id)
				user._doc.following = user.following.length
				user._doc.follower = user.follower.length
				return user
			})
			res.status(200).json({ data })
		} catch (err) {
			console.log(err)
			res.status(500).json({ error: "There's can error" })
		}
	}

	// username, ten, des, dia chi, avatar, cover
	// username, ten, des, dia chi, avatar, cover
	async updateInfo(req, res) {
		try {
			if (req.user) {
				let { fullname, bio, birthday, address } = req.body
				if (birthday) birthday = new Date(birthday)

				await User.updateOne(
					{ _id: req.user.id },
					{ $set: { fullname, birthday } }
				)

				if (bio) {
					await User.updateOne(
						{ _id: req.user.id },
						{ $set: { 'contact_info.bio': bio } }
					)
				}

				if (bio) {
					await User.updateOne(
						{ _id: req.user.id },
						{ $set: { 'contact_info.bio': bio } }
					)
				}

				if (address) {
					await User.updateOne(
						{ _id: req.user.id },
						{ $set: { 'contact_info.address': address } }
					)
				}

				// console.log(data)
				res.status(201).json({ message: 'Change  info successful.' })
			} else {
				res.status(401).json({ message: 'Not authorize' })
			}
		} catch (err) {
			console.log('update info:', err)
			res.status(500).json({ Error: 'Error' })
		}
	}

	async changeAvatar(req, res) {
		try {
			if (req.user) {
				const file = req.file
				
				//check if file is png or jpg
				console.log(file.mimetype);
				if (!file.mimetype.includes('image') || file.mimetype.includes('svg') ) {

					return res.status(400).json({ message: 'File is not image' })
				}
				const data = await addNewFile(file.path, 'image', req.user.id)
				// delete temp file after upload with multer
				await unlinkAsync(file.path)

				await User.findOneAndUpdate(
					{ _id: req.user.id },
					{ avatarUrl: data.url }
				)

				res.status(201).json({ message: 'Change avatar successful' })
			} else {
				res.status(401).json({ message: 'Not authorized' })
			}
		} catch (err) {
			console.log('Error:', err)
			res.status(500).json({ error: "There's an error" })
		}
	}

	async changeCoverImage(req, res) {
		try {
			if (req.user) {
				const file = req.file
				const data = await addNewFile(file.path, 'image', req.user.id)

				// delete temp file after upload with multer
				await unlinkAsync(file.path)

				await User.findOneAndUpdate(
					{ _id: req.user.id },
					{ coverUrl: data.url }
				)

				res.status(201).json({
					message: 'Change cover image successful',
				})
			} else {
				res.status(401).json({ message: 'Not authorized' })
			}
		} catch (err) {
			console.log('Error:', err)
			res.status(500).json({ error: "There's an error" })
		}
	}

	async checkUsername(req, res) {
		try {
			const isExisted = await User.exists({
				username: req.query.username,
			})

			if (isExisted)
				return res.status(200).json({ message: 'username is existed' })
			return res.status(200).json({ message: 'username is valid' })
		} catch (error) {
			return res.status(500).json({ message: 'Server error' })
		}
	}

	async updateUsername(req, res) {
		try {
			const isExisted = await User.exists({
				username: req.query.username,
			})

			if (isExisted)
				return res.status(403).json({ message: 'username is existed' })

			await User.updateOne(
				{ _id: req.user.id },
				{ username: req.body.username }
			)
			return res
				.status(200)
				.json({ message: 'change username successful' })
		} catch (error) {
			return res.status(500).json({ message: 'Server error' })
		}
	}

	// get User by id
	async getUserById(req, res) {
		try {
			const query = req.query.username
				? {
						username: req.query.username,
				  }
				: { id: req.query.id }
			const user = await User.getUser(query).select(
				'-password -devices -__v -email -phone -deleted_at'
			)
			user.birthday = formatDate(user.birthday)

			const follower = user.follower.length
			const following = user.following.length
			const post = await Post.find({ author: user._id }).count()
			if (req.query.me) {
				const _currentUser = await User.findOne({
					username: req.query.me,
				})
				const isFollowing = _currentUser.following.includes(user._id)
				const isFriend =
					_currentUser.following.includes(user._id) &&
					_currentUser.follower.includes(user._id)

				delete user.follower
				delete user.following

				return res.status(200).json({
					data: user,
					metadata: {
						follower,
						following,
						post,
						isFollowing,
						isFriend,
						isMe: req.query.me === req.query.username,
					},
				})
			}
			if (user.deleted_at)
				return res
					.status(400)
					.json({ message: ' This account has been deleted' })

			return res.status(200).json({
				data: user,
				metadata: {
					follower,
					following,
					post,
				},
			})
		} catch (err) {
			console.log('Error', err)
			res.status(500).json({ message: 'Server error' })
		}
	}

	// get list of follower
	async getFollower(req, res) {
		try {
			const user = await User.findOne({ username: req.query.username })
			const myId = req.user.id

			let follower = await Promise.all(
				user.follower.map((userId) =>
					User.getUserWithIdLessData(userId)
				)
			)

			follower = follower.filter((user) => user != null)

			const data = follower.map((user) => {
					user._doc.isFollowing = user._doc.follower.includes(
						req.user.id
					)
					delete user._doc.follower
					return user
			})

			res.status(200).json({ data })
		} catch (err) {
			console.log('Error', err)
			res.status(500).json({ message: 'Server error' })
		}
	}

	// get list of following
	async getFollowing(req, res) {
		try {
			const user = await User.findOne({ username: req.query.username })

			const following = await Promise.all(
				user.following.map((userId) =>
					User.getUserWithIdLessData(userId)
				)
			)
			res.status(200).json({ data: following })
		} catch (err) {
			console.log('Error', err)
			res.status(500).json({ message: 'Server error' })
		}
	}

	// get list of friend
	async getFriends(req, res) {
		try {
			const user = await User.findById(req.user.id)
			const friendId = user.follower.filter((value) =>
				user.following.includes(value)
			)
			const friends = await Promise.all(
				friendId.map((userId) => User.getUserWithIdLessData(userId))
			)
			res.status(200).json({ data: friends })
		} catch (err) {
			console.log('Error', err)
			res.status(500).json({ message: 'Error' })
		}
	}

	async recommendFriends(req, res) {
		try {
			let recommend = []
			const user = await User.findById(req.user.id)


			recommend = await User.find({
				_id: { $ne: req.user.id },
				follower: { $ne: req.user.id },
			})
				.sort({ follower: -1 })
				.limit(10)
			
			let listFriends = []

			for (let i = 0; i < user.friends.length; i++) {
				const friend = await User.findById(user.friends[i])
				listFriends.concat(friend.friends)
			}
			const friends = await Promise.all(
				listFriends.map((friendId) => {
					User.findById(friendId)
				})
			)
			// merge friends and recommend if friends length < 10 and max length = 10
			if (friends.length < 10) {
				recommend = recommend.concat(friends)
			}
			// remove duplicate
			recommend = recommend.filter(
				(user, index, self) =>
					index === self.findIndex((u) => u._id === user._id)
			)


			res.status(200).json({ data: recommend })
		} catch (error) {
			console.log('Error', error)
			res.status(500).json({ Error: 'Server Error' })
		}
	}

	//id will be in param
	async getFriendsByUserId(req, res) {
		try {
			const user = await User.findById(req.user.id)
			const friendId = user.follower.filter((value) =>
				user.following.includes(value)
			)
			const friends = await Promise.all(
				friendId.map((userId) => User.getUserWithIdLessData(userId))
			)
			res.status(200).json({ data: friends })
		} catch (err) {
			console.log('Error', err)
			res.status(500).json({ Error: 'Error' })
		}
	}

	async follow(req, res) {
		try {
			// using  addToSet to avoid duplicated following or follower
			const user = await User.findOne({ username: req.params.username })

			if (!user)
				return res.status(400).json({ message: 'User is not existed' })

			if (req.user.id === user._id)
				return res.status(400).json("You can't follow yourself")

			// if you blocked can't follow them
			// console.log(user)
			if (user.blocked_users.includes(req.user.id)) {
				res.status(400).json({
					message: 'You are blocked by this user',
				})
				return
			}
			await User.updateOne(
				{ _id: req.user.id },
				{ $addToSet: { following: user._id } }
			)
			await User.updateOne(
				{ _id: user._id },
				{ $addToSet: { follower: req.user.id } }
			)
			res.status(200).json({ message: 'Following ' + user.username })
		} catch (err) {
			console.log('Follow Error: ', err)
			res.status(500).json({ message: 'Error' })
		}
	}

	async unFollow(req, res) {
		try {
			// using  addToSet to avoid duplicated following or follower
			const user = await User.findOne({ username: req.params.username })

			if (!user)
				return res.status(400).json({ message: 'User is not existed' })

			// current user
			await User.updateOne(
				{ _id: req.user.id },
				{ $pull: { following: user._id } }
			)

			// following user
			await User.updateOne(
				{ _id: user._id },
				{ $pull: { follower: req.user.id } }
			)
			res.status(200).json({ message: 'Unfollowed a user' })
		} catch (err) {
			console.log('Follow Error: ', err.message)
			res.status(500).json({ message: 'Error' })
		}
	}

	async destroy(req, res) {
		const session = await mongoose.startSession()
		session.startTransaction()
		try {
			await User.deleteOne({ _id: req.user.id }).session(session)
			await Post.deleteMany({ author: req.user.id }).session(session)
			await Comment.deleteMany({ author: req.user.id }).session(session)
			await File.deleteMany({ owner: req.user.id }).session(session)
			await session.commitTransaction()
			return res.status(200).json({ message: 'Account deleted successful' })
		} catch (error) {
			await session.abortTransaction()
			return res.status(500).json({ message: 'Server error' })
		} finally {
			session.endSession()
		}
	}
}

module.exports = new UserController()
