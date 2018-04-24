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
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    allowed_domains: [String],
    created_date: {
        type: Date,
        default: Date.now
    },

    //groups field will add later
});


const Workspace = mongoose.model('Workspace', workspaceSchema);
module.exports = Workspace;