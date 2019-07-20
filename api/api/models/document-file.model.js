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
    }
});

const DocumentFile = mongoose.model('DocumentFile', DocumentFileSchema);

module.exports = DocumentFile;
