const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Workspace = require("../models/workspace")


const UserSchema = new Schema({

    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    workspace_name: {
        type: String,
        required: true,
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
        default: null,
    },
    company_name: {
        type: String,
        default: null
    },
    company_join_date: {
        type: Date,
        default: Date.now,
    },
    created_date: {
        type: Date,
        default: Date.now,
    },
    skills: [{
        type: String,
        default: null,
        trim: true
    }],
    files: [{
        type: String,
        default: null
    }]

    //groups field will add later
});


const User = mongoose.model('User', UserSchema);
module.exports = User;