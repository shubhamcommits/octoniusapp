import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const UserSchema = new Schema({
    _account: {
        type: Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    full_name: {
        type: String,
        required: true,
        lowercase: true
    },
    profile_pic: {
        type: String,
        default: 'default_user.png'
    },
    search_history: {
        type: Array,
        default: []
    },
    workspace_name: {
        type: String,
        required: true
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace'
    },
    role: {
        type: String,
        required: true,
        default: 'member',
        enum: ['owner', 'member', 'admin', 'manager', 'invite']
    },
    phone_number: {
        type: String,
        default: null
    },
    mobile_number: {
        type: String,
        default: null
    },
    current_position: {
        type: String,
        default: null
    },
    bio: {
        type: String,
        default: null
    },
    company_name: {
        type: String,
        default: null
    },
    company_join_date: {
        type: Date,
        default: moment().format()
    },
    created_date: {
        type: Date,
        default: moment().format()
    },
    skills: [{
        type: String,
        default: null
    }],
    files: [{
        type: String,
        default: null
    }],
    _groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group',
        // unique : true
    }],
    stats: {
        lastTaskView: {
            type: String,
            default: 'kanban'
        },
        groups: [{
            _group: {
                type: Schema.Types.ObjectId,
                ref: 'Group'
            },
            count: {
                type: Number,
                default: 1
            }
        }],
        favorite_groups: [{
            type: Schema.Types.ObjectId,
            ref: 'Group'
        }],
        dashboard_period: {
            type: Number,
            default: 7
        },
        group_dashboard_period: {
            type: Number,
            default: 7
        },
        group_dashboard_members_period: {
            type: String,
            default: 7
        },
        default_icons_sidebar: {
            type: Boolean,
            default: false
        }
    },
    _private_group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    integrations: {
        gdrive: {
            token: {
                type: String,
                default: null
            }
        }
    },
    out_of_office: [{
        type: {
            type: String,
            enum: ['holidays', 'sick', 'personal']
        },
        date: {
            type: Date,
            default: moment().format()
        },
        approved: {
            type: Boolean,
            default: false
        }
    }]
});

const User = mongoose.model('User', UserSchema);

export { User };
