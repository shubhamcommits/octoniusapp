import mongoose from 'mongoose';
const { Schema } = mongoose;

const ColumnSchema = new Schema({
    _group: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    custom_fields_to_show: [{
        type: String,
        required: true,
        default: ['priority']
    }],
    project_type: {
        type: Boolean,
        required: true,
        default: false
    },
    start_date: {
        type: Date,
        default: null
    },
    due_date: {
        type: Date,
        default: null
    }
});

const Column = mongoose.model('Column', ColumnSchema);

export { Column }