const express = require('express')
const router = express.Router()
const SearchHistoryController = require('../../app/controller/SearchHistoryController')
const authMiddleware = require('../../middleware/auth.middleware')
const idCheckerMiddleware = require('../../middleware/idcheck.auth.middleware')

router.get('/text', authMiddleware, SearchHistoryController.getSearchTextHistory)

router.get('/user', authMiddleware, SearchHistoryController.getSearchUserHistory)

router.post('/text', authMiddleware, SearchHistoryController.createSearchTextHistory)

router.post('/user', authMiddleware, SearchHistoryController.createSearchUserHistory)

router.delete('/:id', idCheckerMiddleware, authMiddleware, SearchHistoryController.deleteSearchHistory)

router.get('/search', authMiddleware, SearchHistoryController.recommendSearchText)


module.exports = router


