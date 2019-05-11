const mongoose = require('mongoose');

const { Schema } = mongoose;

const ConnectionHistorySchema = new Schema({
  src: {
    type: String
  },
  doc: {
    type: String
  },
  user: {
    type: String
  }
});

const ConnectionHistory = mongoose.model('ConnectionHistory', ConnectionHistorySchema, 'connection_history');

module.exports = ConnectionHistory;
