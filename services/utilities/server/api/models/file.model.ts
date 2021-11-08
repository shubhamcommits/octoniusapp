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
        default: Date.now
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
});

const File = mongoose.model('File', FileSchema);

export { File }
