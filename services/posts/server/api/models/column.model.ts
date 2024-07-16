const { DateTime } = require("luxon");
import mongoose from 'mongoose';


const { Schema } = mongoose;

const ColumnSchema = new Schema({
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: false
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
          default: 'EUR'
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
                default: DateTime.now()
            },
            _user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            _created_user: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            _resource: {
                type: Schema.Types.ObjectId,
                ref: 'Resource',
                required: false
            },
            _resource_activity: {
                type: String
            }
        }]
    },
    kanban_order: {
        type: Number
    },
    permissions: [
        {
            right: {
                type: String,
                enum: ['view', 'edit', 'hide']
            },
            rags: [],
            _members: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        }
    ],
    custom_fields_to_show_kanban: [{
        type: String,
        required: false
    }],
    crm_custom_fields_to_show_kanban: [{
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