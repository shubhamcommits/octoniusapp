import moment from 'moment';
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
        default: moment().format()
    },
    isLoggedIn: {
        type: Boolean,
        default: true
    },
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Auth = mongoose.model('Auth', AuthSchema);

export { Auth }
