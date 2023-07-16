const express = require('express')
const router = express.Router()
const postController = require('../../app/controller/PostController')
const authMiddleware = require('../../middleware/auth.middleware')
const verifyMiddleware = require('../../middleware/verify.middleware')
const upload = require('../../configs/upload')
const idCheckerMiddleware = require('../../middleware/idcheck.auth.middleware')

// search post
router.get('/', authMiddleware, postController.searchPost)

// search post
router.get('/hot', authMiddleware, postController.hotPost)

// get user's liked post
router.get('/like', authMiddleware, postController.getLikedPost)

// get user's timeline
router.get('/timeline/:username', authMiddleware, postController.getTimelinePost)

// get recommend post
router.get('/recommend', authMiddleware, postController.recommendPost)

// get user's all post 
router.get('/profile/:username', authMiddleware, postController.getPostByUserId)

// get post by Id
router.get('/:postId', idCheckerMiddleware, verifyMiddleware, postController.getPost)

// check post classifier for testing
// router.post('/classifierac', postController.checkContentClassify)

// create post
router.post('/create', upload.array("attach_files"), authMiddleware, postController.createPost)

// create post with json
router.post('/create-link', authMiddleware, postController.createPostWithLink)

// share a post with postId
router.post('/share', authMiddleware, postController.sharePost)

//delete post
router.delete('/:postId', idCheckerMiddleware, authMiddleware, postController.deletePost)

// like or unlike a post
router.put('/:postId/like', idCheckerMiddleware, authMiddleware, postController.likeOrUnlikePost)




module.exports = router