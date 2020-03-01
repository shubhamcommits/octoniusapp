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
    }
});

const Group = mongoose.model('Group', GroupSchema);

export { Group }
