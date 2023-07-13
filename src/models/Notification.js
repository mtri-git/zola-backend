const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: () => this.type === 'follow'
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: () => this.type === 'post' || this.type === 'like'
  },
  type: {
    type: String,
    required: true,
    enum: ['post', 'like', 'comment', 'share', 'follow']
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
	deleted_at: {type: Date, default: null, index: {expires: 2592000  }}
    // expires: 86400 
    // expire after 2 months
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;