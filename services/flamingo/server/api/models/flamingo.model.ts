import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const FlamingoSchema = new Schema({
    _file: {
        type: Schema.Types.ObjectId,
        ref: 'File'
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

const Flamingo = mongoose.model('Flamingo', FlamingoSchema);

export { Flamingo };
