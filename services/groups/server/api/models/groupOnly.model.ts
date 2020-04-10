import moment from 'moment';
import mongoose from 'mongoose';
import { Group } from './group.model';

const { Schema } = mongoose;

const GroupOnlySchema = new Schema({
    group_id: {
        type: Schema.Types.ObjectId,
        ref: Group,
        required: true
    },
    invited_user: {
        type: String,
        required: true
    },
    invited_date: {
        type: Date,
        default: moment().format()
    },
    joined: {
        type: Boolean,
        default: false
    }
})

const GroupOnly = mongoose.model('GroupOnly', GroupOnlySchema);

export{ GroupOnly };