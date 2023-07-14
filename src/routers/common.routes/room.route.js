const express = require('express')
const router = express.Router()
const roomController = require('../../app/controller/RoomController')
const authMiddleware = require('../../middleware/auth.middleware')
const idCheckerMiddleware = require('../../middleware/idcheck.auth.middleware')

// create a new room
router.post('/create', authMiddleware, roomController.createRoom)

//get all chat room from a user
router.get('/', authMiddleware, roomController.getRoomByUserById)

//get all chat group that user is in
router.get('/group', authMiddleware, roomController.getChatGroupByUserId)

// get all user from a chat room with query roomId
router.get('/user', authMiddleware, roomController.getAllUserInRoom)


// check user in room
router.get('/check-user' , authMiddleware, roomController.checkUserIsInRoom)

// check room with two user
router.get('/check', authMiddleware, roomController.checkRoomWithTwoUser)

// get chat room from roomId
router.get('/:roomId' , idCheckerMiddleware, authMiddleware, roomController.getRoomById)

// check user is admin of room
router.get('/is-admin/:id' , idCheckerMiddleware, authMiddleware, roomController.checkUserIsAdmin)

// add user to room
router.patch('/add-user/:id' , idCheckerMiddleware, authMiddleware, roomController.addUserToRoom)

// remove user from room
router.patch('/remove-user/:id' , idCheckerMiddleware, authMiddleware,  roomController.removeUserFromRoom)

// leave room
router.patch('/leave-room/:id' , authMiddleware, roomController.leaveRoom)

//delete room
router.delete('/delete-room/:id' , authMiddleware, roomController.deleteRoom)

// change room name
router.patch('/change-room-name/:id' , authMiddleware, roomController.changeRoomName)


module.exports = router