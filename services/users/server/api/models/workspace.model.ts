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
        default: 'assets/images/organization.png'
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
    allow_decentralized_roles: {
        type: Boolean,
        default: false
    },
    profile_custom_fields: {
        type: [{
            name: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            input_type: {
                type: Boolean,
                default: false
            },
            values: {
                type: [String],
                required: true,
                default: []
            }
        }]
    },
    invited_users: [{
        email: {
            type: String,
            required: true
        },
        invited_date: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['group', 'workspace']
        },
        _user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        _group: {
            type: Schema.Types.ObjectId,
            ref: 'Group',
            required: false
        },
        accepted: {
            type: Boolean,
            default: false,
            required: true
        }
    }],
    created_date: {
        type: Date,
        default: moment().format()
    },
    management_private_api_key: {
        type: String,
        required: true,
        default: 'TZCDAC3CDCJILSRGA2II'
    }
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export { Workspace }
