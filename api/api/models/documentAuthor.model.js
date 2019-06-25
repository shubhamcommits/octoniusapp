const mongoose = require('mongoose');

const { Schema } = mongoose;

const DocumentAuthorSchema = new Schema({
  _user_id: {
    type: String,
    required: true
  },
  name:{
      type: String,
      required: true
  },
  color:{
      type: String,
      required: true
  },
  _post_id: {
      type : String,
      required: true

  }
});

const DocumentAuthor = mongoose.model('DocumentAuthor', DocumentAuthorSchema);

module.exports = DocumentAuthor;
