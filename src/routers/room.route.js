const express = require('express')
const router = express.Router()
const roomController = require('../app/controller/RoomController')
const authMiddleware = require('../middleware/auth.middleware')

// create a new room
router.post('/create', authMiddleware, roomController.createRoom)

//get all chat room from a user
router.get('/', authMiddleware, roomController.getRoomByUserById)

// get all user from a chat room with query roomId
router.get('/user', authMiddleware, roomController.getAllUserInRoom)

router.get('/check', authMiddleware, roomController.checkRoomWithTwoUser)

// get chat room from roomId
router.get('/:roomId' , authMiddleware, roomController.getRoomById)

// add user to room
router.patch('/add-user' , authMiddleware, roomController.addUserToRoom)

// remove user from room
router.patch('/remove-user' , authMiddleware, roomController.removeUserFromRoom)


module.exports = router