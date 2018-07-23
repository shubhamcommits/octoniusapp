const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require('../models/user')

const workspaceSchema = new Schema({
    company_name: {
        type: String,
        default: null
    },
    workspace_name: {
        type: String,
        unique: true,
        required: true
    },
    workspace_avatar: {
        type: String,
        default: 'default_organization.png'
    },
    owner_email: {
        type: String,
        required: true,
    },
    owner_password: {
        type: String,
        required: true,
    },
    owner_first_name: {
        type: String,
        required: true,
        default: null
    },
    owner_last_name: {
        type: String,
        required: true,
        default: null
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    allowed_domains: [{
        type: String,
        default: null,
        trim: true
    }],
    invited_users: [{
        email: {
            type: String,
            require: true
        }
    }],
    created_date: {
        type: Date,
        default: Date.now
    },

    //groups field will add later
});


const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;
