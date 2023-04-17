const express = require('express')
const router = express.Router()

const authMiddleware = require('../../middleware/auth.middleware')
const fileController = require('../../app/controller/FileController')


router.get('/', authMiddleware, fileController.getFile)

// get file public
router.get('/:username', fileController.getFilePublic)

router.get('/post/:fileId', authMiddleware, fileController.getPostByFile)


module.exports = router
