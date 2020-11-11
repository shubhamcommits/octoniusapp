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
                enum: ['Assigned to', 'Status is', 'Section is'],
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
        },
        action: {
            name: {
                type: String,
                enum: ['Move to', 'Assign to'],
            },
            _user: {
                type: Schema.Types.ObjectId,
                ref: 'User'
            },
            section: {
                type: String,
                default: ''
            }
        }
    }]

});

const Flow = mongoose.model('Flow', FlowSchema);

export { Flow }
