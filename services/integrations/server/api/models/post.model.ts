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
        required: true
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rags: [],
    created_date: {
        type: Date,
        default: Date.now
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
        started_at: {
            type: Date,
            default: null
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
                    default: Date.now
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
                enum: ['Currency $', 'Currency €', 'Percent', 'Number']
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
        }
    },
    records: {
        status: [{
            date: {
                type: Date,
                required: true,
                default: moment().format()
            },
            status: {
                type: String,
                enum: ['to do', 'in progress', 'done']
            },
            _user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }],
        column: [{
            date: {
                type: Date,
                required: true,
                default: moment().format()
            },
            title: {
                type: String,
                required: true,
                default: 'to do'
            },
            _user: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            }
        }],
        group_change: [{
            date: {
                type: Date,
                required: true,
                default: moment().format()
            },
            _fromGroup: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Group'
            },
            _toGroup: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'Group'
            },
            type: {
                type: String,
                required: true,
                default: 'copy'
            },
            _user: {
                type: Schema.Types.ObjectId,
                required: true,
                ref: 'User'
            }
        }],
        assignments: [{
            date: {
                type: Date,
                required: true,
                default: moment().format()
            },
            type: {
                type: String,
                enum: ['assign', 'unassign']
            },
            _assigned_to: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            _assigned_from: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            }
        }]
    }
});

const Post = mongoose.model('Post', PostSchema);

export { Post }
