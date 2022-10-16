import moment from 'moment';
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
            default: moment().format()
        },
        is_admin: {
            type: Boolean,
            required: true,
            default: false
        },
        default: []
    }],
    _admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
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
    }
});

const Chat = mongoose.model('Chat', ChatSchema);

export { Chat }
