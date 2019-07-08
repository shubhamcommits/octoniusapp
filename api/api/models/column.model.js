const mongoose = require('mongoose');

const { Schema } = mongoose;

const Columns = new Schema({
    title: String,
    taskCount: Number
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
            taskCount: 0
        },{
            title: 'in progress',
            taskCount: 0
        },{
            title: 'done',
            taskCount: 0
        }]
    }
});

const Column = mongoose.model('Column', ColumnSchema);

module.exports = Column;