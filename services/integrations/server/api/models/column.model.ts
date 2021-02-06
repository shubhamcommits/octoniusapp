import mongoose from 'mongoose';
const { Schema } = mongoose;

/*
const Columns = new Schema({
    title: String,
    taskCount: Number,
    custom_fields_to_show: [String]
});
*/

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
    }]
    /*
    columns: {
        type: [Columns],
        default: [{
            title: 'to do',
            taskCount: 0,
            custom_fields_to_show: ['priority']
        }]
    }*/
});

const Column = mongoose.model('Column', ColumnSchema);

export { Column }