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
        default: 'assets/images/icon-new-group.svg'
    },
    archived_group: {
        type: Schema.Types.Boolean,
        required: true,
        default: false,
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
    members_fares: {
        type: Map,
        of: Number
    },
    enabled_rights: {
        type: Schema.Types.Boolean,
        default: false,
    },
    enabled_campaign: {
        type: Schema.Types.Boolean,
        default: false,
    },
    keep_pinned_open: {
        type: Schema.Types.Boolean,
        default: false,
    },
    rags: [
        {
            rag_tag: Schema.Types.String,
            tag_members: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }],
            right: {
                type: String,
                enum: ['view', 'edit', 'hide']
            }
        }
    ],
    project_type: {
        type: Schema.Types.Boolean,
        default: false,
    },
    enable_allocation: {
        type: Schema.Types.Boolean,
        default: false,
    },
    project_status: {
        type: String,
        enum: ['ON TRACK', 'NOT STARTED', 'IN DANGER', 'ACHIEVED']
    },
    shuttle_type: {
        type: Schema.Types.Boolean,
        default: false,
    },
    _shuttle_section: {
        type: Schema.Types.ObjectId,
        ref: 'Column'
    },
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
        },
        custom_fields: {
            type: [{
                name: {
                    type: String
                },
                value: {
                    type: String
                }
            }]
        }
    },
    share_files: {
        type: Boolean,
        default: false,
    }
});

const Group = mongoose.model('Group', GroupSchema);

export { Group }
