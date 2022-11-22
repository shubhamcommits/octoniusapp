import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const EntitySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    company_name: {
        type: String,
        required: false
    },
    tax_id: {
        type: String,
        required: false
    },
    currency_code: {
        type: String,
        required: false
    },
    address_line_1: {
        type: String,
        required: false
    },
    address_line_2: {
        type: String,
        required: false
    },
    city: {
        type: String,
        required: false
    },
    zip_code: {
        type: String,
        required: false
    },
    state: {
        type: String,
        required: false
    },
    country: {
        type: String,
        required: false
    },
    variables: [{
        name: {
            type: String,
            required: false
        },
        type: {
            type: String,
            required: false
        },
        value: {
            type: Number,
            required: false
        },
    }],
    _workspace: {
        type: Schema.Types.ObjectId,
        required:true,
        ref: 'Workspace'
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Entity = mongoose.model('Entity', EntitySchema);

export { Entity };
