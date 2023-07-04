const express = require('express')
const router = express.Router()
const authMiddleware = require('../../middleware/auth.middleware')

const hashtagController = require('../../app/controller/HashtagController')

router.get('/trending', authMiddleware, hashtagController.getTrendingHashtags)

module.exports = router