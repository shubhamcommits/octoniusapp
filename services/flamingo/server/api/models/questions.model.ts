import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const QuestionSchema = new Schema({
    type: {
        type : String,
        required: true,
        enum: ['Welcome', 'Thanks', 'ShortText', 'Yes/No', 'Scale', 'Dropdown']
    },
    text: {
        type : String,
        required: true,
    },
    options: [{
        type: String
    }],
    image_url: {
        type: String
    },
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Question = mongoose.model('Question', QuestionSchema);

export { Question };
