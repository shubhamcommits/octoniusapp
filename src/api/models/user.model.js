const moment = require('moment');
const mongoose = require('mongoose');

// const { Group, Workspace } = require('./');

const { Schema } = mongoose;

const UserSchema = new Schema({
  active: {
    type: Boolean,
    required: true,
    default: true
  },
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  full_name: {
    type: String,
    required: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profile_pic: {
    type: String,
    default: 'default_user.png'
  },
  workspace_name: {
    type: String,
    required: true
  },
  _workspace: {
    type: Schema.Types.ObjectId,
    ref: 'Workspace'
  },
  role: {
    type: String,
    required: true,
    default: 'member',
    enum: ['owner', 'member', 'admin']
  },
  phone_number: {
    type: String,
    default: null
  },
  mobile_number: {
    type: String,
    default: null
  },
  current_position: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: null
  },
  company_name: {
    type: String,
    default: null
  },
  company_join_date: {
    year: Number,
    month: Number,
    day: Number
  },
  created_date: {
    type: Date,
    default: moment().format()
  },
  skills: [{
    type: String,
    default: null,
    trim: true
  }],
  files: [{
    type: String,
    default: null
  }],
  _groups: [{
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }],
  _private_group: {
    type: Schema.Types.ObjectId,
    ref: 'Group'
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
