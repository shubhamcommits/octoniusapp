import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const AnswerSchema = new Schema({
    _form: {
        type: Schema.Types.ObjectId,
        ref: 'Form'
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    answers:[{
        answer: { type: String },
        _question: {type: Schema.Types.ObjectId,ref: 'User'}
    }],
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Answer = mongoose.model('Answer', AnswerSchema);

export { Answer };
