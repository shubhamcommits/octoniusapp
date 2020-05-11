import mongoose from 'mongoose';

const { Schema } = mongoose;

const FileSchema = new Schema({
    original_name: {
        type: String,
        default: null
    },
    modified_name: {
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
        required: true
    }
});

const File = mongoose.model('File', FileSchema);

export { File }
