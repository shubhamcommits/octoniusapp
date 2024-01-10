import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;
const TimeTrackingEntitySchema = new Schema({
    date: {
        type: Date,
        default: moment().format()
    },
    hours: {
        type: String,
        default: null
    },
    minutes: {
        type: String,
        default: null
    },
    _category: {
        type: String,
        default: null
    },
    comment: {
        type: String,
        default: null
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _task: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    created_date: {
        type: Date,
        default: moment().format()
    },
    _created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const TimeTrackingEntity = mongoose.model('TimeTrackingEntity', TimeTrackingEntitySchema);

export { TimeTrackingEntity }
