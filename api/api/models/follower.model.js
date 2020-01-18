const moment = require('moment');
const mongoose = require('mongoose');

// const { Group, Workspace } = require('./');

const { Schema } = mongoose;

const FollowerSchema = new Schema({
    userId: {
        type: String,
        required: true,
    },
    taskId: {
        type: String,
        required: true
    }
});

const Follower = mongoose.model('follower', FollowerSchema);

module.exports = Follower;
