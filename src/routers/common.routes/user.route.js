const express = require('express')
const router = express.Router()
const userController = require('../../app/controller/UserController')
const authMiddleware = require('../../middleware/auth.middleware')

const upload = require('../../configs/upload')


// Search user
router.get('/', authMiddleware, userController.searchUser)

// get user info
router.get('/get-info', authMiddleware, userController.getInfo)

//update user
router.patch('/update-info',authMiddleware, userController.updateInfo)

// get user by id, or username
router.get('/get', userController.getUserById)

//change user avatar 
// only file type is image
router.patch('/change-avatar', upload.single("file"), authMiddleware, userController.changeAvatar)

//change user cover image
router.patch('/change-cover', upload.single("file"), authMiddleware, userController.changeCoverImage)

//get friends
router.get('/friends', authMiddleware ,userController.getFriendsByUserId)

//get follower
router.get('/followers', authMiddleware, userController.getFollower)

//get following
router.get('/followings', authMiddleware, userController.getFollowing)

//get friends
router.get('/recommend-friends', authMiddleware, userController.recommendFriends)

// delete user
router.delete('/destroy', authMiddleware, userController.destroy)

// follow a user
router.patch('/follow/:username', authMiddleware, userController.follow)

// unfollow a user
router.patch('/unfollow/:username', authMiddleware, userController.unFollow)

// check username is valid
router.get('/check', authMiddleware, userController.checkUsername)

// check username is valid
router.put('/change-username', authMiddleware, userController.updateUsername)

module.exports = router