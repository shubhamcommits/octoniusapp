import mongoose from 'mongoose';
const { Schema } = mongoose;

const Columns = new Schema({
    title: String,
    taskCount: Number,
    custom_fields_to_show: [String]
});

const ColumnSchema = new Schema({
    groupId: {
        type: String,
        required: true
    },
    columns: {
        type: [Columns],
        default: [{
            title: 'to do',
            taskCount: 0,
            custom_fields_to_show: []
        }]
    }
});

const Column = mongoose.model('Column', ColumnSchema);

export { Column }