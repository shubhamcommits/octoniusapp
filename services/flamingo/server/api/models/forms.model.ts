import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const FormSchema = new Schema({
    name: {
        type: String,
    },
    _owner: { 
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    _folder:{
        type: Schema.Types.ObjectId,
        ref: 'Folder'
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
