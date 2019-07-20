const mongoose = require('mongoose');

const { Schema } = mongoose;

const DocumentSchema = new Schema({
  _id: {
    type: String
  },
  ops: Schema.Types.Mixed,
  _type: {
    type: String
  },
  _v: {
    type: Number
  },
  _m: [{
    ctime: {
      type: Number
    },
    mtime: {
      type: Number
    }
  }]
});

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;
