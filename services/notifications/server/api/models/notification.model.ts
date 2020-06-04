import mongoose from 'mongoose';

const { Schema } = mongoose;

const NotificationSchema = new Schema({
    _actor: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _origin_comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    _origin_post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    read_date: {
        type: Date,
        default: null
    },
    type: {
        type: String,
        required: true,
        enum: ['assignment', 'mention']
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);

export { Notification }
