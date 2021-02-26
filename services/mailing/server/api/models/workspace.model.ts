import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const workspaceSchema = new Schema({
    company_name: {
        type: String,
        default: null
    },
    workspace_name: {
        type: String,
        unique: true,
        required: true
    },
    access_code: {
        type: String,
        unique: true,
        required: true
    },
    workspace_avatar: {
        type: String,
        default: 'default_organization.png'
    },
    owner_email: {
        type: String,
        required: true,
        // unique : true
    },
    owner_first_name: {
        type: String,
        required: true,
        default: null
    },
    owner_last_name: {
        type: String,
        required: true,
        default: null
    },
    _owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    allowed_domains: [{
        type: String,
        required: true
    }],
    invited_users: [{
        type: String,
        required: true
    }],
    created_date: {
        type: Date,
        default: moment().format()
    },
    billing: {
        subscription_id: {
            type: String
        },
        current_period_end: {
            type: Number
        },
        scheduled_cancellation: {
            type: Boolean,
            default: false
        },
        failed_payments: {
            type: Array,
            default: []
        },
        success_payments: {
            type: Array,
            default: []
        },
        quantity: {
            type: Number,
            default: 1
        }
    }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export { Workspace }
