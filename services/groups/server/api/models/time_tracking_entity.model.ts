import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;
const TimeTrackingEntitySchema = new Schema({
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
    _category: {
        type: String,
        default: null,
        required: true
    },
    times: [{
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
        }
    }],
    comment: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: moment().format(),
        required: true
    },
    _created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

const TimeTrackingEntity = mongoose.model('TimeTrackingEntity', TimeTrackingEntitySchema);

export { TimeTrackingEntity }
