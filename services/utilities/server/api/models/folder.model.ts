import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const FolderSchema = new Schema({
    folder_name: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: moment().format()
    },
    _created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    _parent: {
        type: Schema.Types.ObjectId,
        ref: 'Folder',
        required: false
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

const Folder = mongoose.model('Folder', FolderSchema);

export { Folder }
