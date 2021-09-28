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
            default: Date.now
        },
        trigger: [{
            name: {
                type: String,
                enum: ['Assigned to', 'Custom Field', 'Section is', 'Status is', 'Task is CREATED', 'Subtasks Status']
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
            }
        }],
        action: [{
            name: {
                type: String,
                enum: ['Assign to', 'Change Status to', 'Custom Field', 'Move to', 'Shuttle task']
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
            _shuttle_group: {
                type: Schema.Types.ObjectId,
                ref: 'Group'
            }
        }]
    }]
});

const Flow = mongoose.model('Flow', FlowSchema);

export { Flow }
