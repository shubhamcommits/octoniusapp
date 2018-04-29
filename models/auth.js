const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Workspace = require('../models/workspace');
const User = require('../models/user');

const AuthSchema = new Schema({

    token: {
        type: String,
        default: null
    },
    device_id: {
        type: String,
        default: null
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    workspace_name: {
        type: String,
        default: null
    },
    last_login: {
        type: Date,
        default: Date.now
    },
    isLoggedIn: {
        type: Boolean,
        default: true
    },
    created_date: {
        type: Date,
        default: Date.now
    }
});

const Auth = mongoose.model('Auth', AuthSchema);
module.exports = Auth;