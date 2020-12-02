import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const SlackAuthSchema = new Schema({
    token: {
        type: String,
        default: null
    },
    slack_user_id: {
        type: String,
        default: null
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    team_name: {
        type: String,
        default: null
    },
    team_id: {
        type: String,
        default: null
    },
    incoming_webhook: {
        type: String,
        default: null
    },
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const SlackAuth = mongoose.model('SlackAuth', SlackAuthSchema);

export { SlackAuth }
