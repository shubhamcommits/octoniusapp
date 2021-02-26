import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const AccountSchema = new Schema({
    active: {
        type: Boolean,
        required: true,
        default: true
    },
    email: {
        type: String,
        required: true,
        // unique : true
    },
    password: {
        type: String,
        required: true
    },
    _workspace: [{
        type: Schema.Types.ObjectId,
        ref: 'Workspace'
    }],
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Account = mongoose.model('Account', AccountSchema);

export { Account };
