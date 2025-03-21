import { text } from 'body-parser';
const { DateTime } = require("luxon");
import mongoose from 'mongoose';

const { Schema } = mongoose;

const FlamingoSchema = new Schema({
    _file: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    _questions:[{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }],
    publish: {
        type: Boolean,
        required: true,
        default: false
    },
    responses: [{
      answers: [{
        _question: {
          type: Schema.Types.ObjectId,
          ref: 'Question'
        },
        text_answer: {
            type : String,
        },
        positive_answer: {
            type: Boolean
        },
        negative_answer: {
            type: Boolean
        },
        scale_answer: {
            type: Number
        },
        dropdown_answer: {
            type: String
        },
        answer_multiple: {
            type: [String]
        }
      }],
      created_date: {
          type: Date,
          default: DateTime.now()
      }
    }],
    created_date: {
        type: Date,
        default: DateTime.now()
    }
});

const Flamingo = mongoose.model('Flamingo', FlamingoSchema);

export { Flamingo };
