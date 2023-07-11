const mongoose = require('mongoose');

const searchHistorySchema = new mongoose.Schema({
  searchText: {
    type: String,
    //required if searchUser is not present
    required: function () {
      return !this.searchUser;
    }
  },
  searchUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    //required if searchText is not present
    required: function () {
      return !this.searchText;
    }
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