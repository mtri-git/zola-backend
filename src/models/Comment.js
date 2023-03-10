const mongoose = require('mongoose')

const CommentSchema = new mongoose.Schema({
    content: String,
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reply_to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    },
    like_by: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    created_at: { 
        type: Date, 
        default: Date.now
    },
    updated_at: { 
        type: Date, 
        default: null
    },
    deleted_at: { 
        type: Date, 
        default: null
    },
})


const Comment = mongoose.model('Comment', CommentSchema)
module.exports = Comment