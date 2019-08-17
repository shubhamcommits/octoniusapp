const mongoose = require('mongoose');

const { Schema } = mongoose;

const DocumentFileSchema = new Schema({
    _post_id: {
        type: Schema.Types.ObjectId
    },
    _content: {
        type: Schema.Types.Mixed
    },
    _name: {
        type: String
    },
    _group_id: {
        type: Schema.Types.ObjectId
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now,
        required: true,
    },
});

const DocumentFile = mongoose.model('DocumentFile', DocumentFileSchema);

module.exports = DocumentFile;
