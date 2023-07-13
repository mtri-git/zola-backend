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

// before remove delete all child comment
CommentSchema.pre('remove', async function(next) {
    try {
        await this.model('Comment').deleteMany({ parent_id: this._id })
        next()
    } catch (error) {
        next(error)
    }
})

const Comment = mongoose.model('Comment', CommentSchema)
module.exports = Comment