const { DateTime } = require("luxon");
import mongoose from 'mongoose';

const { Schema } = mongoose;

const ResourceSchema = new Schema({
    title: {
        type: String,
        default: null
    },
    description: {
        type: String,
        default: null
    },
    stock: {
        type: Number,
        default: null
    },
    unit_price: {
        type: Number,
        default: null
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    custom_fields: {
        type: Map,
        of: String
    },
    created_date: {
        type: Date,
        default: DateTime.now()
    },
    _created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    last_updated_date: {
        type: Date,
        default: DateTime.now()
    },
    activity: [{
        quantity: {
            type: Number,
            default: null
        },
        add_inventory: {
            type: Boolean,
            default: false
        },
        _project: {
            type: Schema.Types.ObjectId,
            ref: 'Column'
        },
        date: {
            type: Date,
            default: DateTime.now()
        },
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        file: {
            original_name: {
                type: String,
                default: null
            },
            modified_name: {
                type: String,
                default: null
            }
        },
        comment: {
            type: String,
            default: null
        },
        edited_date: {
            type: Date,
            default: DateTime.now()
        }
    }]
});

const Resource = mongoose.model('Resource', ResourceSchema);

export { Resource }
