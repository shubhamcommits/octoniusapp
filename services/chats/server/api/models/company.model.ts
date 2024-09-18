import mongoose from 'mongoose';

const { Schema } = mongoose;

const CompanySchema = new Schema({
    
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: false
    },
    company_pic: {
        type: String,
        default: 'assets/images/icon-new-group.svg'
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: false
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        ref: 'Workspace',
        required: true
    },
    // Custom Fields
    crm_custom_fields: {
        type: Map,
        of: String
    }
});

const Company = mongoose.model('Company', CompanySchema);

export { Company }
