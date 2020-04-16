import mongoose from 'mongoose';

const { Schema } = mongoose;

const PostSchema = new Schema({

    // POST DETAILS
    title: {
        type: String,
        trim: true
    },
    content: {
        type: String,
        trim: true
    },
    _content_mentions: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    type: {
        type: String,
        required: true,
        enum: ['normal', 'event', 'task', 'performance_task', 'document']
    },
    _liked_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments_count: {
        type: Number,
        default: 0
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    created_date: {
        type: Date,
        default: Date.now
    },
    files: [{
        orignal_name: {
            type: String,
            default: null
        },
        modified_name: {
            type: String,
            default: null
        }
    }],
    tags: [{
        type: String,
        default: []
    }],
    _read_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    _followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    // TASK
    task: {
        due_to: {
            type: Date,
            default: null
        },
        _assigned_to: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        status: {
            type: String,
            default: 'to do'
        },
        started_at: {
            type: Date,
            default: null
        },
        completed_at: {
            type: Date,
            default: null
        },
        unassigned: {
            type: String,
            default: "No"
        },
        _column: {
            title: {
                type: String,
                default: 'to do'
            }
        }
    },

    // PERFORMANCE TASK
    performance_task: {
        _assigned_to: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        skills: [{
            type: String,
            default: null
        }],
        status: {
            type: String,
            enum: ['to do', 'in progress', 'done']
        },
        started_at: {
            type: Date,
            default: null
        },
        completed_at: {
            type: Date,
            default: null
        }
    },

    // EVENT
    event: {
        due_to: {
            type: String,
            default: null
        },
        _assigned_to: [{
            type: Schema.Types.ObjectId,
            ref: 'User'
        }]
    }
});

const Post = mongoose.model('Post', PostSchema);

export { Post }
