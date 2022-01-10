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
    },
    approval_active: {
        type: Boolean,
        required: true,
        default: false
    },
    approval_flow_launched: {
        type: Boolean,
        required: true,
        default: false
    },
    approval_envelope: {
        type: String,
        required: false
    },
    approval_flow: [
        {
            _assigned_to: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            confirmation_code: {
                type: String
            },
            confirmed: {
                type: Boolean,
                required: true,
                default: false
            },
            confirmation_date: {
                type: Date,
                default: moment().format()
            },
            signature_code: {
                type: String,
                required: false
            }
        }
    ],
    approval_history: [
        {
            _actor: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rejection_description: {
                type: String
            },
            action: {
                type: String,
                required: true,
                enum: ['created', 'deleted', 'launch', 'rejected', 'approved']
            },
            approval_date: {
                type: Date,
                default: moment().format()
            }
        }
    ]
});

const File = mongoose.model('File', FileSchema);

export { File }
