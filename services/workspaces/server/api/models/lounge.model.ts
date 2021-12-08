import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const LoungeSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique : false
    },
    type: {
        type: String,
        required: false,
        enum: ['category', 'lounge']
    },
    header_pic: {
        type: String,
        default: 'assets/images/lounge_details_header.jpg'
    },
    icon_pic: {
        type: String,
        default: 'assets/images/lounge-icon.jpg'
    },
    _parent: {
        type: Schema.Types.ObjectId,
        ref: 'Lounge'
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group'
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Workspace'
    },
    _posted_by: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    created_date: {
        type: Date,
        required: true,
        default: moment().format()
    },
    _lounges: [{
        type: Schema.Types.ObjectId,
        ref: 'Lounge'
    }],
    _stories: [{
        type: Schema.Types.ObjectId,
        ref: 'Story'
    }]
});

const Lounge = mongoose.model('Lounge', LoungeSchema);

export { Lounge };
