const mongoose = require('mongoose');

const { Schema } = mongoose;

const GroupFileUploadSchema = new Schema({
    _posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },

    files: [{
        orignal_name: {
          type: String,
          default: null
        },
        modified_name: {
          type: String,
          default: null
        }
      }],
      _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
      },
    created_date: {
        type: Date,
        default: Date.now
    },
});

const GroupFileUpload = mongoose.model('GroupFileSectionUpload', GroupFileUploadSchema);

module.exports = GroupFileUpload;
