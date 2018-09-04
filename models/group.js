const moment = require('moment');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Workspace = require("../models/workspace")
const User = require("../models/user");


const GroupSchema = new Schema({

    group_name: {
        type: String,
        required: true,
        trim: true
    },
    group_avatar: {
        type: String,
        default: 'default_group.png',
    },
    workspace_name: {
        type: String,
        required: true,
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    _members: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    _admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    description: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: moment().format(),
    },
    files: [{
        type: String,
        default: null
    }]
});


const Group = mongoose.model('Group', GroupSchema);
module.exports = Group;
