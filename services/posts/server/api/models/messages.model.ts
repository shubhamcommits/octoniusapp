const { DateTime } = require("luxon");
import mongoose from 'mongoose';

const { Schema } = mongoose;

const MessageSchema = new Schema({
    _chat: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Chat'
    },
    posted_on: {
        type: Date,
        required: true,
        default: DateTime.now()
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    _content_mentions: [{
        type: Schema.Types.Mixed,
        ref: 'User'
    }],
    edited: {
        type: Boolean,
        required: true,
        default: false
    },
});

const Message = mongoose.model('Message', MessageSchema);

export { Message }
