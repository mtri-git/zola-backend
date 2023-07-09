const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  searchText: {
    type: String,
    validate: {
      validator: function(v) {
        return !(v && this.searchUser);
      },
      message: 'Only one of searchText or searchUser is allowed',
    },
  },
  searchUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    validate: {
      validator: function(v) {
        return !(v && this.searchText);
      },
      message: 'Only one of searchText or searchUser is allowed',
    },
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const SearchHistory = mongoose.model('SearchHistory', searchHistorySchema);

module.exports = SearchHistory;