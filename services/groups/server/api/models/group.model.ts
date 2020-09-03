import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const GroupSchema = new Schema({
    group_name: {
        type: String,
        required: true,
        trim: true
    },
    group_avatar: {
        type: String,
        default: 'default_group.png'
    },
    workspace_name: {
        type: String,
        required: true
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    _members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _admins: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    enabledRights: {
        type: Schema.Types.Boolean,
        default: false,
    },
    bars: [
        {
            bar_tag: Schema.Types.String,
            tag_members: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        }
    ],
    description: {
        type: String,
        default: null
    },
    pulse_description: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: moment().format()
    },
    files: [{
        type: String,
        default: null
    }],
    type: {
        type: String,
        default: 'normal'
    },
    conditions: {
        email_domains: {
            type: [String],
            default: []
        },
        job_positions: {
            type: [String],
            default: []
        },
        skills: {
            type: [String],
            default: []
        }
    },
    share_files: {
        type: Boolean,
        default: false,
    },
    members_count: {
        type: Number,
        default: 0
    },
    custom_fields: {
        type: [{
            name: {
                type: String,
                required: true
            },
            title: {
                type: String,
                required: true
            },
            values: {
                type: [String],
                required: true,
                default: []
            }
        }]
    },
    custom_fields_to_show: {
        type: [String],
        default: []
    }
});

const Group = mongoose.model('Group', GroupSchema);

export { Group }
