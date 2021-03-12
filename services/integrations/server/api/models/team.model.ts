import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const TeamAuthSchema = new Schema({
    user_object_id: {
        type: String,
        default: null
    },
    tenant_id: {
        type: String,
        default: null
    },
    _user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const TeamAuth = mongoose.model('TeamAuth', TeamAuthSchema);

export { TeamAuth }
