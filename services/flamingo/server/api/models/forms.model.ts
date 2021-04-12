import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const FormSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    _owner: { 
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    questions:[{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }],
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Form = mongoose.model('Form', FormSchema);

export { Form };
