const { DateTime } = require("luxon");
import mongoose from 'mongoose';

const { Schema } = mongoose;

const CollectionSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    _members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    background_color: {
        type: String
    },
    collection_avatar: {
        type: String,
        default: 'assets/images/icon-new-group.svg'
    },
    content: {
        type: String,
        trim: true
    },
    _content_mentions: [{
        type: Schema.Types.Mixed,
        ref: 'User'
    }],
    // _pages: [{
    //     type: Schema.Types.Mixed,
    //     ref: 'Page'
    // }],
    _files: [{
        type: Schema.Types.Mixed,
        ref: 'File'
    }],
    share: {
        groups: [{
            _group: {
               type: Schema.Types.ObjectId,
                ref: 'Group'
            },
            can_edit: {
                type: Boolean,
                default: false
            }
        }],
        users: [{
            _user: {
               type: Schema.Types.ObjectId,
                ref: 'User'
            },
            can_edit: {
                type: Boolean,
                default: false
            }
        }],
        open_link: {
            status: {
                type: Boolean,
                default: false
            },
            can_edit: {
                type: Boolean,
                default: false
            }
        }
    },
    _created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_date: {
        type: Date,
        default: DateTime.now()
    }
});

const Collection = mongoose.model('Collection', CollectionSchema);

export { Collection }
