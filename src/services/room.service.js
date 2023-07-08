const Room = require('../models/Room')
const User = require('../models/User')

class RoomService {
	async createRoom(roomData) {
		try {
			const room = new Room(roomData)
			await room.save()
			return room
		} catch (error) {
			console.log(error)
			return null
		}
	}

	async getRoomByUserId(userId, page = 1, limit = 10) {
		try {
			const user = await User.findById(userId)
			const room = await Room.aggregate([
			   	{ $match: { $and: [{users: user._id}, {deleted_at: null}] } },
			    {
			      $lookup: {
			        from: "messages",
			        let: { roomId: "$_id" },
			        pipeline: [
			          {
			            $match: {
			              $expr: {
			                $and: [
			                  { $eq: ["$roomId", "$$roomId"] },
			                  { $eq: ["$deleted_at", null] },
			                ],
			              },
			            },
			          },
			          { $sort: { created_at: -1 } },
			          { $limit: 1 },
			        ],
			        as: "last_message",
			      },
			    },
				// look up for users info
				{
					$lookup: {
					from: 'users',
					localField: 'users',
					foreignField: '_id',
					as: 'users_info',
					}
				},
				// look up for sender info
				{
					$lookup: {
					from: 'users',
					localField: 'last_message.sender',
					foreignField: '_id',
					as: 'sender_info',
					}
				},

				// add sender fullname to last message
				{
					$addFields: {
						"last_message.sender_fullname": {
							$ifNull: [{$arrayElemAt: ["$sender_info.fullname", 0]}, null]
						},
					}
				},

				{
					$addFields: {
						timestamp: {
							$cond: {
								if: { $ne: ["$last_message", null] },
								then: {
								  $toDate: {
									$ifNull: [
									  { $arrayElemAt: ["$last_message.created_at", 0] },
									  "$created_at"
									]
								  }
								},
								else: { $toDate: "$created_at" }
							}
						}
					}
				},
					{ $unwind: { path: "$last_message", preserveNullAndEmptyArrays: true } },
					{ $unwind: { path: "$sender_info", preserveNullAndEmptyArrays: true } },
					{
						$project: {
							name: 1,
							created_by: 1,
							isRoom: 1,
							admin: 1,
							created_at: 1,
							updated_at: 1,
							timestamp: 1,
							"last_message.content": 1,
							"last_message.type": 1,
							"last_message.created_at": 1,
							"last_message.sender_fullname": 1,
							"users_info.fullname": 1,
							"users_info.username": 1,
							"users_info.avatarUrl": 1,
							// users: 0
						},
					},
					{ $sort: {timestamp: -1}  },
					{ $skip: (page - 1) * limit },
					{ $limit: limit },

			  ])
			  
			  // change users_info to users
			  for (let i = 0; i < room.length; i++) {
				room[i].users = room[i].users_info
				delete room[i].users_info
				if (!room[i].hasOwnProperty("last_message") ) {
					room[i].last_message = {
						content: "Chưa có tin nhắn nào",
						type: "message",
						created_at: room[i].created_at
					}
				}
			  }

			return room
		} catch (error) {
			console.log(error)
			return null
		}
	}
}

module.exports = new RoomService()
