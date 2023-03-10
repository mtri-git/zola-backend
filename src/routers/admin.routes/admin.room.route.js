const express = require('express')
const router = express.Router()
const AdminRoomController = require('../../app/admin.controller/AdminRoomController')
const authMiddleware = require('../../middleware/admin.auth.middleware')

router.get('/', authMiddleware ,AdminRoomController.getRoom)
router.delete('/hard-delete/:id', authMiddleware ,AdminRoomController.hardDeleteRoom)
router.get('/:id', authMiddleware ,AdminRoomController.getRoomDetail)
router.delete('/:id', authMiddleware ,AdminRoomController.deleteRoom)
router.put('/recover/:id', authMiddleware ,AdminRoomController.recoverRoom)



module.exports = router