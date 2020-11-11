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
        trigger: {
            name: {
                type: String,
                enum: ['Assigned to', 'Custom Field is', 'Section is', 'Status is', 'Status is CHANGED', 'Task is CREATED']
            },
            _user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            section: {
                type: String,
                default: ''
            },
            status: {
                type: String,
                default: ''
            },
            custom_field: {
                title:{
                    type: String,
                    default: ''
                },
                value:{
                    type: String,
                    default: ''
                }
            }
        },
        action: {
            name: {
                type: String,
                enum: ['Assign to', 'Move to', 'Change Status to']
            },
            _user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            section: {
                type: String,
                default: ''
            },
            status: {
                type: String,
                default: ''
            }
        }
    }]

});

const Flow = mongoose.model('Flow', FlowSchema);

export { Flow }
