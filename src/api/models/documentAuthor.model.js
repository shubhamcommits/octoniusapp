const mongoose = require('mongoose');

const { Schema } = mongoose;

const DocumentAuthorSchema = new Schema({
  id: {
    type: String
  },
  name:{
      type: String
  },
  color:{
      type: String
  },
  _post_id: {
      type : String
  }
});

const DocumentAuthor = mongoose.model('DocumentAuthor', DocumentAuthorSchema);

module.exports = DocumentAuthor;
