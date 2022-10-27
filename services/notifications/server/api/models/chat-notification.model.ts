import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatNotificationSchema = new Schema({
    _actor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _message: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    // _chat: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Chat'
    // },
    created_date: {
        type: Date,
        default: moment().format()
    },
    text: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['new-chat-message', 'added-to-chat']
    },
    read: {
        type: Boolean,
        default: false
    },
    read_date: {
        type: Date,
        default: null
    }
});

const ChatNotification = mongoose.model('ChatNotification', ChatNotificationSchema);

export { ChatNotification }
