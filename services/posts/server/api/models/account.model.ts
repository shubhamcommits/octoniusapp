const { DateTime } = require("luxon");
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
        required: false
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
    ssoType: {
        type: String,
        required: false,
        enum: ['AD', 'GOOGLE', 'LDAP']
    },
    created_date: {
        type: Date,
        default: DateTime.now()
    }
});

const Account = mongoose.model('Account', AccountSchema);

export { Account };
