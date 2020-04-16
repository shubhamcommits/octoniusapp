import mongoose from 'mongoose';

const { Schema } = mongoose;

const CommentSchema = new Schema({
    content: {
        type: String,
        trim: true
    },
    _content_mentions: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _highlighted_content_range: {

        indexes: {
            type: Number
        },
        length: {
            type: Number
        }
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    _commented_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    _post: {
        type: Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    _liked_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    _read_by: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
});

const Comment = mongoose.model('Comment', CommentSchema);

export { Comment }