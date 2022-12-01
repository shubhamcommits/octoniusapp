import moment from 'moment';
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
        type: Schema.Types.Mixed,
        ref: 'User'
    }],
    type: {
        type: String,
        required: true,
        enum: ['normal', 'event', 'task', 'performance_task', 'document']
    },
    likes_count:{
        type: Number,
        default: 0
    },
    _liked_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pin_to_top: {
        type: Boolean,
        default: false
    },
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
        required: false
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    created_date: {
        type: Date,
        default: moment().format()
    },
    files: [{
        original_name: {
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
    read_count:{
        type: Number,
        default: 0
    },
    _read_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: []
    }],
    followers_count:{
        type: Number,
        default: 0
    },
    _followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _assigned_to: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        default: []
    }],
    archived: {
        type: Boolean,
        default: false
    },
    approval_active: {
        type: Boolean,
        required: true,
        default: false
    },
    approval_flow_launched: {
        type: Boolean,
        required: true,
        default: false
    },
    approval_due_date: {
        type: Date,
        default: null
    },
    approval_envelope: {
        type: String,
        required: false
    },
    approval_flow: [
        {
            _assigned_to: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            confirmation_code: {
                type: String
            },
            confirmed: {
                type: Boolean,
                required: true,
                default: false
            },
            confirmation_date: {
                type: Date,
                default: moment().format()
            },
            signature_code: {
                type: String,
                required: false
            },
            description: {
                type: String
            }
        }
    ],
    approval_history: [
        {
            _actor: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            description: {
                type: String
            },
            action: {
                type: String,
                required: true,
                enum: ['created', 'deleted', 'launch', 'rejected', 'approved']
            },
            approval_date: {
                type: Date,
                default: moment().format()
            }
        }
    ],
    logs: [
        {
            action: {
                type: String,
                required: true,
                enum: ['created', 'change_content', 'change_status', 'change_section', 'assigned_to', 'removed_assignee', 'new_due_date', 'new_start_date', 'commented', 'change_cf', 'copy_to', 'moved_to', 'make_dependency', 'make_dependent', 'remove_dependency', 'remove_dependent', 'make_ns', 'make_no_ns', 'update_ns', 'make_idea', 'make_no_idea', 'make_milestone', 'make_no_milestone', 'set_parent', 'save_allocation', 'change_title', 'change_time', 'updated_tags', 'attach_file', 'attach_file_cloud']
            },
            _actor: {
                type: Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            action_date: {
                type: Date,
                default: moment().format()
            },
            new_status: {
                type: String
            },
            _new_section: {
                type: Schema.Types.ObjectId,
                ref: 'Column'
            },
            _assignee: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            new_date: {
                type: Date,
                default: moment().format()
            },
            tag: {
                type: String
            },
            cf_title: {
                type: String
            },
            cf_value: {
                type: String
            },
            _group: {
                type: Schema.Types.ObjectId,
                ref: 'Group'
            },
            _task: {
                type: Schema.Types.ObjectId,
                ref: 'Post'
            },
            allocation: {
                type: Number
            }
        }
    ],

    // TASK
    task: {
        due_to: {
            type: Date,
            default: null
        },
        status: {
            type: String,
            default: 'to do'
        },
        completed_at: {
            type: Date,
            default: null
        },
        _column: {
            type: Schema.Types.ObjectId,
            ref: 'Column'
        },
        allocation: {
            type: Number,
            default: 0
        },
        // Custom Fields
        custom_fields: {
            type: Map,
            of: String
        },

        isNorthStar: {
            type: Boolean,
            default: false
        },

        is_idea: {
            type: Boolean,
            default: false
        },

        is_milestone: {
            type: Boolean,
            default: false
        },

        northStar: {
            target_value: {
                type: Number,
                default: 0
            },
            values: [{
                date: {
                    type: Date,
                    default: moment().format()
                },
                value: {
                    type: Number,
                    default: 0
                },
                status: {
                    type: String,
                    enum: ['NOT STARTED', 'ON TRACK', 'IN DANGER', 'ACHIEVED']
                },
                _user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User'
                }
            }],
            type: {
                type: String,
                enum: ['Currency', 'Percent', 'Number']
            },
            currency: {
                type: String
            },
            header_background_color: {
                type: String
            }
        },

        idea: {
            negative_votes: [{
                type: String,
                default: null
            }],
            positive_votes: [{
                type: String,
                default: null
            }]
        },
        
        start_date: {
            type: Date,
            default: null
        },

        _parent_task: {
            type: Schema.Types.ObjectId,
            ref: 'Post'
        },
        is_template: {
            type: Boolean,
            default: false
        },
        template_name: {
            type: String,
            default: null
        },
        _dependency_task:[{
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }],
        _dependent_child:[{
            type: Schema.Types.ObjectId,
            ref: 'Post'
        }],
        shuttle_type: {
            type: Boolean,
            default: false
        },
        shuttles: [{
            _shuttle_group: {
                type: Schema.Types.ObjectId,
                ref: 'Group'
            },
            _shuttle_section: {
                type: Schema.Types.ObjectId,
                ref: 'Column'
            },
            shuttle_status: {
                type: String,
                default: 'to do'
            },
            shuttled_at: {
                type: Date,
                required: true,
                default: moment().format()
            }
        }]
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
        }
    }
});

const Post = mongoose.model('Post', PostSchema);

export { Post }
