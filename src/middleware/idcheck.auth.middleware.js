const mongoose = require('mongoose');

const idCheckerMiddleware = (req, res, next) => {
    const { id, commentId,  postId, userId,  roomId } = req.params;
    // check if id, commentId, postId is valid if it not null
    if (id && !mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid id' })
    }
    if (commentId && !mongoose.isValidObjectId(commentId)) {
        return res.status(400).json({ message: 'Invalid commentId' })
    }
    if (postId && !mongoose.isValidObjectId(postId)) {
        return res.status(400).json({ message: 'Invalid postId' })
    }
    if (userId && !mongoose.isValidObjectId(userId)) {
        return res.status(400).json({ message: 'Invalid userId' })
    }
    if (roomId && !mongoose.isValidObjectId(roomId)) {
        return res.status(400).json({ message: 'Invalid roomId' })
    }
    next();
}

module.exports = idCheckerMiddleware
