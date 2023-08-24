import { DateTime } from 'luxon';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const HolidaySchema = new Schema({
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['holidays', 'sick', 'personal']
    },
    start_date: {
        type: Date,
        default: DateTime.now()
    },
    end_date: {
        type: Date,
        default: DateTime.now()
    },
    num_days: {
        type: Number,
        default: 1,
        required: true
    },
    approval_envelope: {
        type: String,
        required: false
    },
    _approval_manager: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['approved', 'pending', 'rejected'],
        required: true,
        default: 'pending'
    },
    description: {
        type: String
    },
    rejection_description: {
        type: String
    }
});

const Holiday = mongoose.model('Holiday', HolidaySchema);

export { Holiday };
