const mongoose = require('mongoose');

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    trim: true
  },
  _content_mentions: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  type: {
    type: String,
    required: true,
    enum: ['normal', 'event', 'task', 'performance_task', 'document']
  },
  _liked_by: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments_count: {
    type: Number,
    default: 0
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  _group: {
    type: Schema.Types.ObjectId,
    ref: 'Group',
    required: true
  },
  _posted_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  task: {
    due_to: {
      type: String,
      default: null
    },
    _assigned_to: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['to do', 'in progress', 'done']
    },
    started_at: {
      type: Date,
      default: null
    },
    completed_at: {
      type: Date,
      default: null
    }
  },
  performance_task: {
    _assigned_to: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    skills: [{
      type: String,
      default: null
    }],
    status: {
      type: String,
      enum: ['to do', 'in progress', 'done']
    },
    started_at: {
      type: Date,
      default: null
    },
    completed_at: {
      type: Date,
      default: null
    }
  },
  event: {
    due_to: {
      type: String,
      default: null
    },
    _assigned_to: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  created_date: {
    type: Date,
    default: Date.now
  },
  files: [{
    orignal_name: {
      type: String,
      default: null
    },
    modified_name: {
      type: String,
      default: null
    }
  }],
  tags: [{
    type: String,
    default: []
  }]
});

const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
