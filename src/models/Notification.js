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
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: () => this.type === 'post' || this.type === 'like'
  },
  type: {
    type: String,
    required: true
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
    // expires: 86400 
    // expire after 2 months
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;