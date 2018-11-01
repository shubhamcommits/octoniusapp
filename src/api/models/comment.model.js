const mongoose = require('mongoose');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  content: {
    type: String,
    trim: true
  },
  _content_mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  created_date: {
    type: Date,
    default: Date.now
  },
  _commented_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  _post: {
    type: Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  }
});

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;
