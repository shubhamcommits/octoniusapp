import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const FlowSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    steps: [{
        created_date: {
            type: Date,
            default: moment().format()
        },
        trigger: [{
            name: {
                type: String,
                enum: ['Assigned to', 'Custom Field', 'CRM Custom Field', 'Section is', 'Status is', 'Task is CREATED', 'Subtasks Status', 'Approval Flow is Completed', 'Due date is']
            },
            _user: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }],
            _section: {
                type: Schema.Types.ObjectId,
                ref: 'Column'
            },
            status: {
                type: String,
                default: ''
            },
            subtaskStatus: {
                type: String,
                default: ''
            },
            custom_field: {
                name:{
                    type: String,
                    default: ''
                },
                value:{
                    type: String,
                    default: ''
                }
            },
            crm_custom_field: {
                name:{
                    type: String,
                    default: ''
                },
                value:{
                    type: String,
                    default: ''
                }
            },
            due_date_value: {
                type: String,
                enum: ['tomorrow', 'today', 'overdue']
            }
        }],
        action: [{
            name: {
                type: String,
                enum: ['Assign to', 'Change Status to', 'Custom Field', 'CRM Custom Field', 'Move to', 'Shuttle task', 'Set Due date', 'Set Estimation Time to']
            },
            _user: [{
                type: Schema.Types.ObjectId,
                ref: 'User'
            }],
            _section: {
                type: Schema.Types.ObjectId,
                ref: 'Column'
            },
            status: {
                type: String,
                default: ''
            },
            custom_field: {
                name:{
                    type: String,
                    default: ''
                },
                value:{
                    type: String,
                    default: ''
                }
            },
            crm_custom_field: {
                name:{
                    type: String,
                    default: ''
                },
                value:{
                    type: String,
                    default: ''
                }
            },
            _shuttle_group: {
                type: Schema.Types.ObjectId,
                ref: 'Group'
            },
            due_date_value: {
                type: String,
                enum: ['tomorrow', 'end_of_week', 'end_of_next_week', 'end_of_month']
            },
            estimation: {
                hours: {
                    type: String,
                    default: null
                },
                minutes: {
                    type: String,
                    default: null
                }
            },
        }]
    }]
});

const Flow = mongoose.model('Flow', FlowSchema);

export { Flow }
