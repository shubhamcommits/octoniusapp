import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ColumnSchema = new Schema({
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    custom_fields_to_show: [{
        type: String,
        required: true
    }],
    project_type: {
        type: Boolean,
        required: true,
        default: false
    },
    start_date: {
        type: Date,
        default: null
    },
    due_date: {
        type: Date,
        default: null
    },
    budget:{
        amount_planned: {
            type: Number
        },
        currency: {
          type: String,
          default: 'EUR',
          enum: ['USD', 'EUR']
        },
        expenses: [{
            amount: {
                type: Number
            },
            reason: {
                type: String
            },
            date: {
                type: Date,
                default: moment().format()
            },
            _user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            }
        }]
    },
    kanban_order: {
        type: Number
    },
    rags: [],
    custom_fields_to_show_kanban: [{
        type: String,
        required: false
    }],
    archived: {
        type: Boolean,
        default: false
    }
});

const Column = mongoose.model('Column', ColumnSchema);

export { Column }