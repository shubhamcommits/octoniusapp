import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const FileSchema = new Schema({
    original_name: {
        type: String,
        default: 'New Folio'
    },
    modified_name: {
        type: String,
        default: 'New Folio'
    },
    type: {
        type: String,
        default: 'folio',
        required: false,
        enum: ['file', 'folio' , 'flamingo', 'campaign']
    },
    _parent: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    mime_type: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: moment().format()
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    _folder : {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: false
    },
    _campaign_user_view : {
        fields : [{
            type: String
        }],
        rows_count: {
            type: Number,
            default: 0
        }
    },
    show_headings: {
        type: Boolean,
        required: true,
        default: false
    },
    show_comments: {
        type: Boolean,
        required: true,
        default: false
    },
    permissions: [
        {
            right: {
                type: String,
                enum: ['view', 'edit', 'hide']
            },
            rags: [],
            _members: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        }
    ],
    description: {
        type: String,
        trim: true
    },
    _description_mentions: [{
        type: Schema.Types.Mixed,
        ref: 'User'
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

const File = mongoose.model('File', FileSchema);

export { File }
