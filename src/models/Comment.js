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
    parent_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }
    ,
    reply_to:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
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
        default: null,
        index: {expires: 604800}
    },
})


const Comment = mongoose.model('Comment', CommentSchema)
module.exports = Comment