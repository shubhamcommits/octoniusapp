const { DateTime } = require("luxon");
import mongoose from 'mongoose';

const { Schema } = mongoose;

const AuthSchema = new Schema({
    token: {
        type: String,
        default: null
    },
    device_id: {
        type: String,
        default: null
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    workspace_name: {
        type: String,
        default: null
    },
    last_login: {
        type: Date,
        default: DateTime.now()
    },
    isLoggedIn: {
        type: Boolean,
        default: true
    },
    created_date: {
        type: Date,
        default: DateTime.now()
    }
});

const Auth = mongoose.model('Auth', AuthSchema);

export { Auth }
