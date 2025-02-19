const { DateTime } = require("luxon");
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
    to_all: {
        type: String,
    },
    _origin_comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    },
    _origin_post: {
        type: Schema.Types.ObjectId,
        ref: 'Post'
    },
    company: {
        _company: {
            type: Schema.Types.ObjectId,
            ref: 'Company'
        },
        _task: {
            type: Schema.Types.ObjectId,
        },
        _update: {
            type: Schema.Types.ObjectId,
        },
    },
    _origin_group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    _shuttle_group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    _origin_folio: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    _collection: {
        type: Schema.Types.ObjectId,
        ref: 'Collection'
    },
    _page: {
        type: Schema.Types.ObjectId,
        ref: 'Page'
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    created_date: {
        type: Date,
        default: DateTime.now()
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
        enum: ['assignment', 'mention', 'mention_folio', 'started', 'completed', 'comment', 'like_comment', 'follow', 'likes', 'new-post', 'join-group', 'leave-group', 'launch-approval-flow', 'approved-item', 'reject-item', 'launch-approval-flow-due-date', 'shuttleTask', 'mention_collection', 'mention_page', 'hive', 'hive_new_entity', 'post-edited', 'crm-task-assignment', 'crm-update-assignment']
    }
});

const Notification = mongoose.model('Notification', NotificationSchema);

export { Notification }
