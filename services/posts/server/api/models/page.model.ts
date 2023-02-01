import mongoose from 'mongoose';
import { DateTime } from 'luxon';

const { Schema } = mongoose;

const PageSchema = new Schema({
    title: {
        type: String,
        default: 'New Folio'
    },
    _parent: {
        type: Schema.Types.ObjectId,
        ref: 'Page'
    },
    _updated_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    updated_date: {
        type: Date,
        default: DateTime.now()
    },
    created_date: {
        type: Date,
        default: DateTime.now()
    },
    _created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _collection : {
        type: Schema.Types.ObjectId,
        ref: 'Collection',
        required: true
    },
    content: {
        type: String,
        trim: true
    },
    _content_mentions: [{
        type: Schema.Types.Mixed,
        ref: 'User'
    }],
    _comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    _liked_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _files:[{
        type: Schema.Types.ObjectId,
        ref: 'File'
    }],
    tags: [{
        type: String,
        default: []
    }],
    // Custom Fields
    custom_fields: {
        type: Map,
        of: String
    }
});

const Page = mongoose.model('Page', PageSchema);

export { Page }
