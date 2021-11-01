import mongoose from 'mongoose';

const { Schema } = mongoose;

const FolderSchema = new Schema({
    folder_name: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: Date.now
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
    rags: []
});

const Folder = mongoose.model('Folder', FolderSchema);

export { Folder }
