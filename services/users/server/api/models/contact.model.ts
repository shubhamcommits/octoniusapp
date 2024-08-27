import mongoose from 'mongoose';

const { Schema } = mongoose;

const ContactSchema = new Schema({
    
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    concact_pic: {
        type: String,
        default: 'assets/images/user.png'
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    phones: [{
        type: String,
    }],
    emails: [{
        type: String,
    }],
    links: [{
        type: String,
    }],
    _company: {
        type: Schema.Types.ObjectId,
        ref: 'Company'
    },
    position: {
        type: String
    },
    // Custom Fields
    crm_custom_fields: {
        type: Map,
        of: String
    }
});

const Contact = mongoose.model('Contact', ContactSchema);

export { Contact }
