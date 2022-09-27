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
    email: {
        type: String,
        required: false
    },
    profile_pic: {
        type: String,
        default: 'assets/images/user.png'
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
        enum: ['owner', 'member', 'admin', 'manager', 'guest']
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
    // Custom Fields
    profile_custom_fields: {
        type: Map,
        of: String
    },
    files: [{
        type: String,
        default: null
    }],
    _groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group',
        // unique : true
    }],
    selected_widgets: {
        type: [String],
        default: ['WORK_STATISTICS', 'WORKLOAD', 'VELOCITY'/*, 'PULSE'*/, 'PEOPLE_DIRECTORY', 'ORGANIZATIONAL_STRUCTURE', 'WORK_STATISTICS_NORTH_STAR', 'ENGAGEMENT', 'KPI_PERFORMANCE']
    },
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
        },
        locale: {
            type: String,
            default: 'en',
            enum: ['es', 'en', 'de', 'fa']
        }
    },
    _private_group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    firebase_token: {
        type: String,
        default: null
    },
    integrations: {
        gdrive: {
            token: {
                type: String,
                default: null
            }
        },
        box: {
            token: {
                type: String,
                default: null
            }
        },
        is_slack_connected: {
            type: Boolean,
            default: null
        },
        is_teams_connected:{
            type: Boolean,
            default: false
        },
        slack: {
            token: {
                type: String,
                default: null
            },
            bot_access_token: {
                type: String,
                default: null
            },
            slack_user_id: {
                type: String,
                default: null
            },
            team_name: {
                type: String,
                default: null
            },
            team_id: {
                type: String,
                default: null
            },
            incoming_webhook: {
                type: String,
                default: null
            }
        },
        teams: {
            user_object_id: {
                type: String,
                default: null
            },
            user_id: {
                type: String,
                default: null
            },
            tenant_id: {
                type: String,
                default: null
            }
        },
        zapier:{
            webhook:[{
                trigger: {
                    type: String,
                    default: null
                },
                webhookURl: {
                    type: String,
                    default: null
                }
            }]
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
