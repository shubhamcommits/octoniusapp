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
    group_image: {
        type: String,
        default: null,
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
    created_date: {
        type: Date,
        default: Date.now,
    },
    files: [{
        type: String,
        default: null
    }]

});


const Group = mongoose.model('Group', GroupSchema);
module.exports = Group;