const Room = require('../../models/Room')
const User = require('../../models/User')
const roomService = require('../../services/room.service')
const mongoose = require('mongoose')

class RoomController {
	// create new chat room need a list of member id
	async createRoom(req, res) {
		try {
			if (req.user) {
				const { name, users, isRoom } = req.body
				const roomData = { name, users, isRoom }
				roomData.created_by = req.user.id
				roomData.admins = [req.user.id]
				// Check user add to room is exist
				const validUserList = await User.exists({
					_id: { $in: roomData.users },
				})

				// if room is 2 user and already exist
				if (roomData.users.length === 1) {
					roomData.isRoom = false
					const objectIdArray = [...roomData.users, req.user.id].map(
						(str) => mongoose.Types.ObjectId(str)
					)
					const room = await Room.findOne({
						users: objectIdArray,
						isRoom: false,
						deleted_at: null,
					})

					roomData.users = objectIdArray

					if (room) {
						return res.status(200).json({
							message: 'Room is existed. Cant create new',
							data: room,
						})
					}
					else{
						roomData.admins = [req.user.id, ...users]
						const room = new Room(roomData)
						await room.save()
						return res.status(201).json({
							message: 'Create a new chat room',
							data: room,
						})
					}
				}

				if (isRoom && roomData.users.length === 1) {
					res.status(400).json({
						message: 'A room has to have more than 2 users',
					})
				}

				if (validUserList) {
					roomData.users.push(req.user.id)
					// roomData.admins.push(req.user.id)
					const room = new Room(roomData)
					await room.save()
					res.status(201).json({
						message: 'Create a new chat room',
						data: room,
					})
				} else {
					res.status(400).json({ message: 'Invalid list of user' })
				}
			} else {
				res.status(401).json({ message: 'Not authorize' })
			}
		} catch (err) {
			console.log(err)
			res.status(500).json({ message: 'Server error' })
		}
	}

	async checkRoomWithTwoUser(req, res) {
		try {
			if (req.user) {
				const user = await User.findOne({
					username: req.query.username,
				})
				const room = await Room.findOne({
					users: { $size: 2, $all: [req.user.id, user._id] },
				})
				// console.log(room)
				if (room && user) {
					res.status(403).json({
						message: 'Room is existed. Cant create new',
					})
				} else res.status(200).json({ message: 'Room is not existed.' })
			} else {
				res.status(401).json({ message: "Can't access this" })
			}
		} catch (error) {
			console.log(error)
			res.status(500).json({ message: "Can't access this !" })
		}
	}

	async getRoomById(req, res) {
		try {
			if (req.user) {
				const room = await Room.findOne({
					_id: req.params.roomId,
					deleted_at: null,
				})

				if (!room) {
					return res.status(404).json({ message: 'Room not found' })
				}

				if (room.users.includes(req.user.id)) {
					const roomDoc = await Room.getRoomById(req.params.roomId)

					for (let i = 0; i < roomDoc.users.length; i++) {
						roomDoc.users[i].role = roomDoc.admins.includes(
							roomDoc.users[i]._id
						)
							? 'admin'
							: 'member'
					}

					return res.status(200).json({ room: roomDoc })
				} else {
					return res.status(401).json({ error: "Can't access this." })
				}
			} else {
				return res.status(401).json({ message: "Can't access this" })
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Server error' })
		}
	}

	async getRoomByUserById(req, res) {
		try {
			let { limit, page } = req.query

			if (!limit) limit = 10
			else limit = parseInt(limit)
			if (!page) page = 1
			else page = parseInt(page)

			limit = parseInt(limit)
			page = parseInt(page)

			let rooms = await roomService.getRoomByUserId(
				req.user.id,
				page,
				limit
			)

			const total = await Room.countDocuments({
				users: req.user.id,
				deleted_at: null,
			})

			const pagination = {
				total,
				limit,
				page,
				totalPage: Math.ceil(total / limit),
			}

			return res.status(200).json({ Rooms: rooms, pagination })
		} catch (err) {
			console.log(err)
			return res.status(500).json('Fail')
		}
	}

	async getRoomBasicInfo(req, res) {
		try {
			let room = await Room.findOne({
				_id: req.params.roomId,
				deleted_at: null,
			})
			return res.status(200).json({ data: room })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: "Can't access this !" })
		}
	}

	async getAllUserInRoom(req, res) {
		try {
			const room = await Room.findOne({
				_id: req.query.roomId,
				deleted_at: null,
			})

			if (!room) {
				return res.status(404).json({ message: 'Room not found' })
			}
			const users = await User.find({ _id: { $in: room.users } }).select(
				'fullname username contact_info status avatarUrl last_online'
			)

			// add role for user
			for (let i = 0; i < users.length; i++) {
				users[i]._doc.role = room.admins.includes(users[i]._id)
					? 'admin'
					: 'member'
			}

			res.status(200).json({ user: users })
		} catch (err) {
			console.error('Get all User In Room: ', err)
			res.status(500).json({ Error: err })
		}
	}

	async addUserToRoom(req, res) {
		try {
			// using $addToSet to void duplicated values
			const room = await Room.findOne({
				_id: req.params.id,
				isRoom: true,
				deleted_at: null,
			})

			if (!room) {
				return res.status(404).json({ message: 'Room not found' })
			}
			// check user is admin of room
			if (!room.admins.includes(req.user.id)) {
				res.status(401).json({ message: 'You are not admin of room' })
			}
			const userList = req.body.users
			// console.log(userList)
			//check list user is valid
			for (let i = 0; i < userList.length; i++) {
				// check userList[i] is ObjectId valid
				const isValid = await User.exists({ _id: userList[i] })
				if (!isValid) {
					res.status(400).json({ message: 'Invalid list of user' })
				}
			}

			room.users.addToSet(...userList)
			room.save()

			res.status(200).json({ message: 'Add user to room complete' })
		} catch (err) {
			res.status(500).json({ Error: err })
		}
	}

	async checkUserIsInRoom(req, res) {
		try {
			const { roomId, userId } = req.query
			// console.log(roomId, userId)
			const room = await Room.findOne({ _id: roomId })
			if (room.users.includes(userId)) {
				res.status(200).json({ message: 'User is in room' })
			} else {
				res.status(200).json({ message: 'User is not in room' })
			}
		} catch (err) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	async removeUserFromRoom(req, res) {
		// using $addToSet to void duplicated values
		const room = await Room.findById(req.params.id)
		if (!room.admins.includes(req.user.id)) {
			res.status(401).json({ message: 'You are not admin of room' })
		}

		if (await !User.exists({ _id: req.body.userId })) {
			return res.status(401).json({ message: 'User not existed' })
		}
		if (!room.users.includes(req.user.id)) {
			return res.status(401).json({ message: 'Not authorization' })
		}
		try {
			await Room.updateOne(
				{ _id: req.params.id },
				{ $pull: { users: req.body.userId } }
			)
			res.status(200).json({ message: 'Remove user from room complete' })
		} catch (err) {
			res.status(500).json({ message: 'Server error' })
		}
	}

	// get chat group that user is in
	async getChatGroupByUserId(req, res) {
		try {
			const data = await Room.find(
				{ users: req.user.id, isRoom: true, deleted_at: null },
				'name users createdAt isRoom updatedAt'
			).populate('users', 'fullname username avatarUrl')
			return res.status(200).json({ data })
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Server error' })
		}
	}

	// leave room
	async leaveRoom(req, res) {
		try {
			const room = await Room.findOne({
				_id: req.params.id,
				deleted_at: null,
			})
			if (!room) {
				res.status(400).json({ message: 'Room not exist' })
			}

			// change req.user.id to ObjectId
			const userId = mongoose.Types.ObjectId(req.user.id)

			console.log(userId, room.users)

			if (!room.users.includes(userId))
				return res
					.status(401)
					.json({ message: "You're not in this room" })

			if (room.isRoom) {


				// if user is admin => remove admin
				await Room.updateOne(
					{ _id: req.params.id },
					{ $pull: { users: req.user.id } },
					{ $pull: { admins: req.user.id } },
				)
				
				// if room have no admin => set admin to all user
				if (room.admins.length === 0) {
					await Room.updateOne(
						{ _id: req.params.id },
						{ $addToSet: { admins: { $each: room.users } } }
					)
				}

				return res.status(200).json({ message: 'Leave room success' })
			} else {
				return res
					.status(401)
					.json({
						message:
							'This is not room or room has one member can only delete',
					})
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Server error' })
		}
	}

	async checkUserIsAdmin(req, res) {
		try {
			const room = await Room.findOne({ _id: req.params.id })
			if (room.admins.includes(req.query.userId)) {
				return res.status(200).json({ message: 'User is admin' })
			}
			return res.status(200).json({ message: 'User is not admin' })
		} catch (error) {
			return res.status(500).json({ message: 'Server error' })
		}
	}

	// delete room
	async deleteRoom(req, res) {
		try {
			const room = await Room.findOne({
				_id: req.params.id,
				deleted_at: null,
			})
			if (!room) {
				res.status(400).json({ message: 'Room not exist' })
			}

			if (!room.admins.includes(req.user.id) && room.users.length > 2) {
				res.status(401).json({ message: 'You are not admin of room' })
			}

			if (room.users.includes(req.user.id) && room.isRoom) {
				await Room.updateOne(
					{ _id: req.params.id },
					{ deleted_at: Date.now() }
				)
				return res.status(200).json({ message: 'Delete room success' })
			} else {
				// delete room for 2 user
				if (!room.isRoom) {
					await Room.updateOne(
						{ _id: req.params.id },
						{ deleted_at: Date.now() }
					)
					return res
						.status(200)
						.json({ message: 'Delete room success' })
				} else
					return res
						.status(401)
						.json({ message: "Can't access this" })
			}
		} catch (error) {
			console.log(error)
			return res.status(500).json({ message: 'Server error' })
		}
	}

	// change room name
	async changeRoomName(req, res) {
		try {
			const room = await Room.findOne({ _id: req.params.id })
			if (req.body.name === null) {
				return res.status(400).json({ message: 'Name cannot null' })
			}
			if (room.users.includes(req.user.id) && room.isRoom) {
				await Room.updateOne(
					{ _id: req.params.id },
					{ name: req.body.name }
				)
				return res
					.status(200)
					.json({ message: 'Change room name success' })
			}
			return res.status(401).json({ message: "Can't access this" })
		} catch (error) {
			return res.status(500).json({ message: 'Server error' })
		}
	}
}

module.exports = new RoomController()
