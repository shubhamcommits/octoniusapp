import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const StorySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique : false
    },
    type: {
        type: String,
        required: false,
        enum: ['story', 'event']
    },
    header_pic: {
        type: String
    },
    icon_pic: {
        type: String,
        default: 'assets/images/lounge-icon.jpg'
    },
    content: {
        type: String,
        trim: true,
        default: ''
    },
    _content_mentions: [{
        type: Schema.Types.Mixed,
        ref: 'User'
    }],
    _lounge: {
        type: Schema.Types.ObjectId,
        ref: 'Lounge',
        required: true
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
    _assistants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _rejected_assistants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _maybe_assistants: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _liked_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _followers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _read_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    event_date: {
        type: Date,
        default: moment().format()
    },
    event_time: {
        type: String,
        trim: true,
        default: ''
    },
    event_am_pm: {
        type: String,
        trim: true,
        default: 'AM'
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
    }
});

const Story = mongoose.model('Story', StorySchema);

export { Story };
