import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const AccountSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique : true
    },
    password: {
        type: String,
        required: true
    },
    _workspaces: [{
        type: Schema.Types.ObjectId,
        ref: 'Workspace'
    }],
    first_name: {
        type: String,
        required: true
    },
    last_name: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Account = mongoose.model('Account', AccountSchema);

export { Account };
