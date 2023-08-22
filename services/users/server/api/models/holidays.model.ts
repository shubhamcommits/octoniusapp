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
    approval_active: {
        type: Boolean,
        required: true,
        default: false
    },
    approval_flow_launched: {
        type: Boolean,
        required: true,
        default: false
    },
    approval_due_date: {
        type: Date,
        default: null
    },
    approval_envelope: {
        type: String,
        required: false
    },
    approval_flow: 
        {
            _manager: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            confirmation_code: {
                type: String
            },
            confirmed: {
                type: Boolean,
                required: true,
                default: false
            },
            confirmation_date: {
                type: Date,
                default: DateTime.now()
            },
            signature_code: {
                type: String,
                required: false
            },
            description: {
                type: String
            }
        }
    ,
    approval_history: [
        {
            _actor: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            description: {
                type: String
            },
            action: {
                type: String,
                required: true,
                enum: ['created', 'deleted', 'launch', 'rejected', 'approved']
            },
            approval_date: {
                type: Date,
                default: DateTime.now()
            }
        }
    ]
});

const Holiday = mongoose.model('Holiday', HolidaySchema);

export { Holiday };
