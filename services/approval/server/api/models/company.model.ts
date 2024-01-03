import moment from 'moment';
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
        required: true
    },
    company_pic: {
        type: String,
        default: 'assets/images/icon-new-group.svg'
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    // _workspace: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Workspace',
    //     required: true
    // }
});

const Company = mongoose.model('Company', CompanySchema);

export { Company }
