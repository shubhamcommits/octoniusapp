const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Workspace = require("../models/workspace")
const User = require("../models/user");
const Group = require("../models/group");


const PostSchema = new Schema({

    content: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['normal', 'event', 'calendar']
    },
    likes_count: {
        type: Number,
        default: 0,
    },
    _liked_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
    }],
    comments_count: {
        type: Number,
        default: 0,
    },
    _commented_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
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
    created_date: {
        type: Date,
        default: Date.now,
    },
    files: [{
        type: String,
        default: null
    }]

});


const Post = mongoose.model('Post', PostSchema);
module.exports = Post;