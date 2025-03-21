const { DateTime } = require("luxon");
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatSchema = new Schema({

    // CHAT DETAILS
    members: [{
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        joined_on: {
            type: Date,
            required: true,
            default: DateTime.now()
        },
        is_admin: {
            type: Boolean,
            required: true,
            default: false
        },
        /*
        archived: {
            type: Boolean,
            required: true,
            default: false
        },
        */
        default: []
    }],
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    archived: {
        type: Boolean,
        required: true,
        default: false
    },
    last_message_on: {
        type: Date,
        required: false,
        default: DateTime.now()
    }
});

const Chat = mongoose.model('Chat', ChatSchema);

export { Chat }
