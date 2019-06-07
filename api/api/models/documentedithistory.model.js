const mongoose = require('mongoose');

const { Schema } = mongoose;

const OpSchema = new Schema({
  insert: {
    type: String
  },
  retain: {
    type: Number
  },
  delete: {
    type: Number
  },
})

const DocumentEditHistorySchema = new Schema({
  _id: {
    type: String
  },
  src: {
    type: String
  },
  op: {
    ops: [OpSchema],
    user_id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  _type: {
    type: String
  },
  _v: {
    type: Number
  },
  _m: {
    ts: {
      type: Number
    }
  },
  d: {
    type: String,
  }
});

const DocumentEditHistory = mongoose.model('DocumentEditHistory', DocumentEditHistorySchema, 'o_documents');

module.exports = DocumentEditHistory;
