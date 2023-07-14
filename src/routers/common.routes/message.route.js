const express = require('express')
const router = express.Router()
const messageController = require('../../app/controller/MessageController')
const authMiddleware = require('../../middleware/auth.middleware')

const upload = require('../../configs/upload')

//get all chat messages from a chat room
router.get('/find/:roomId', authMiddleware, messageController.getMessageByRoomId)

//get all chat messages from a chat room
router.delete('/recall', authMiddleware, messageController.recallMessage)

// create a new message
router.post('/send', upload.array("attach_files") ,authMiddleware, messageController.sendMessage)

// create a new message
router.post('/send-file', upload.array("attach_files") ,authMiddleware, messageController.sendFileMessage)

// react to message with body messageId=....
router.patch('/reaction/:messageId', authMiddleware, messageController.addReaction)

module.exports = router