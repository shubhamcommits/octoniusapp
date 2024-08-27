const { DateTime } = require("luxon");
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
        type: Boolean,
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
        type: Boolean,
        default: false,
    },
    enabled_campaign: {
        type: Boolean,
        default: false,
    },
    freeze_dates: {
        type: Boolean,
        default: false,
    },
    keep_pinned_open: {
        type: Boolean,
        default: false,
    },
    rags: [
        {
            rag_tag: Schema.Types.String,
            _members: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }]
        }
    ],
    project_type: {
        type: Boolean,
        default: false,
    },
    // enable_allocation: {
    //     type: Boolean,
    //     default: false,
    // },
    project_status: {
        type: String,
        enum: ['ON TRACK', 'NOT STARTED', 'IN DANGER', 'ACHIEVED']
    },
    shuttle_type: {
        type: Boolean,
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
        default: DateTime.now()
    },
    files: [{
        type: String,
        default: null
    }],
    files_for_admins: {
        type: Boolean,
        default: false,
    },
    type: {
        type: String,
        enum: ['normal', 'agora', 'crm', 'accounting', 'resource']
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
    },
    members_count: {
        type: Number,
        default: 0
    },
    selected_widgets: {
        type: [String],
        enum: ['WORK_STATISTICS', 'WORKLOAD', 'VELOCITY', 'ENGAGEMENT', 'KPI_PERFORMANCE', 'RESOURCE_MANAGEMENT', 'CF_TABLE', 'TOP_SOCIAL']
    },
    // resource_management_allocation: {
    //     type: Boolean,
    //     default: true,
    // },
    background_color: {
        type: String
    },
    background_image: {
        type: String
    },
    custom_fields_table_widget: {
        selectTypeCFs: {
            type: [String]
        },
        inputTypeCFs: {
            type: [String]
        }
    },
    crm_custom_fields_table_widget: {
        selectTypeCFs: {
            type: [String]
        },
        inputTypeCFs: {
            type: [String]
        }
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
            input_type: {
                type: Boolean,
                default: false
            },
            input_type_number: {
                type: Boolean,
                default: false
            },
            input_type_text: {
                type: Boolean,
                default: false
            },
            input_type_date: {
                type: Boolean,
                default: false
            },
            values: {
                type: [String],
                required: true,
                default: []
            },
            display_in_kanban_card: {
                type: Boolean,
                default: false
            },
            badge_color: {
                type: String,
                required: true,
                default: '#e4edf8'
            }
        }]
    },
    files_custom_fields: {
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
            input_type_number: {
                type: Boolean,
                default: false
            },
            input_type_text: {
                type: Boolean,
                default: false
            },
            input_type_date: {
                type: Boolean,
                default: false
            },
            values: {
                type: [String],
                required: true,
                default: []
            },
            display_in_kanban_card: {
                type: Boolean,
                default: false
            },
            badge_color: {
                type: String,
                required: true,
                default: '#e4edf8'
            }
        }]
    },
    resources_custom_fields: {
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
            input_type_number: {
                type: Boolean,
                default: false
            },
            input_type_text: {
                type: Boolean,
                default: false
            },
            input_type_date: {
                type: Boolean,
                default: false
            },
            values: {
                type: [String],
                required: true,
                default: []
            },
            display_in_kanban_card: {
                type: Boolean,
                default: false
            },
            badge_color: {
                type: String,
                required: true,
                default: '#e4edf8'
            }
        }]
    },
    crm_custom_fields: {
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
            input_type_number: {
                type: Boolean,
                default: false
            },
            input_type_text: {
                type: Boolean,
                default: false
            },
            input_type_date: {
                type: Boolean,
                default: false
            },
            type: {
                type: String,
                default: false,
                enum: ['contact', 'company', 'product']
            },
            values: {
                type: [String],
                required: true,
                default: []
            },
            display_in_kanban_card: {
                type: Boolean,
                default: false
            },
            badge_color: {
                type: String,
                required: true,
                default: '#e4edf8'
            }
        }]
    },
    crm_custom_fields_to_show: [{
        type: String,
        required: true,
        default: []
    }],
    resources_custom_fields_to_show: [{
        type: String,
        required: true,
        default: []
    }],
    time_tracking_categories: {
        type: [{
            name: {
                type: String,
                required: true
            }
        }]
    },
    pages_to_show: {
        activity: {
            type: Boolean,
            required: true,
            default: true,
        },
        tasks: {
            type: Boolean,
            required: true,
            default: true,
        },
        // crm_setup: {
        //     type: Boolean,
        //     required: true,
        //     default: true,
        // },
        files: {
            type: Boolean,
            required: true,
            default: true,
        },
        library: {
            type: Boolean,
            required: true,
            default: true,
        },
        members: {
            type: Boolean,
            required: true,
            default: true,
        },
        resource_management: {
            type: Boolean,
            required: true,
            default: true,
        },
        dashboard: {
            type: Boolean,
            required: true,
            default: true,
        }
    },
    dialog_properties_to_show: {
        task: {
            type: [String],
            enum: ['status', 'date', 'crm_setup', 'assignee', 'tags', 'custom_fields', 'actions', 'approvals', 'shuttle_task', 'parent_task'],
            default: ['status', 'date', 'assignee', 'tags', 'custom_fields', 'actions', 'approvals', 'shuttle_task', 'parent_task']
        },
        northStar: {
            type: [String],
            enum: ['north_star', 'shuttle_task', 'date', 'assignee', 'tags', 'custom_fields', 'crm_setup', 'actions', 'approvals'],
            default: ['north_star', 'shuttle_task', 'date', 'assignee', 'tags', 'custom_fields', 'actions', 'approvals']
        },
        CRMOrder: {
            type: [String],
            enum: ['crm_setup', 'status', 'date', 'assignee', 'custom_fields'],
            default: ['crm_setup', 'status', 'date', 'assignee', 'custom_fields']
        },
        CRMLead: {
            type: [String],
            enum: ['crm_setup', 'status', 'date', 'assignee', 'tags', 'custom_fields'],
            default: ['crm_setup', 'status', 'date', 'assignee', 'tags', 'custom_fields']
        }
    },
    default_board_card: {
        type: String,
        required: true,
        enum: ['task', 'idea', 'target', 'crm_lead', 'crm_order'],
        default: 'task'
    },
    records: {
        pulses: [{
            date: {
                type: Date,
                required: true,
                default: DateTime.now()
            },
            description: {
                type: String,
                required: true,
                default: ''
            }
        }],
        status: [{
            date: {
                type: Date,
                required: true,
                default: DateTime.now()
            },
            project_status: {
                type: String,
                enum: ['ON TRACK', 'NOT STARTED', 'IN DANGER', 'ACHIEVED']
            }
        }],
        done_tasks_count: [{
            date: {
                type: Date,
                required: true,
                default: DateTime.now()
            },
            count: {
                type: Number,
                required: true,
                default: 0
            }
        }]
    }
});

const Group = mongoose.model('Group', GroupSchema);

export { Group }
