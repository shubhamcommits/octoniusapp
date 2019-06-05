const mongoose = require('mongoose');

const { Schema } = mongoose;

const ColumnSchema = new Schema({
    groupId: {
        type: String,
        required: true
    },
    columns: {
        type: Array,
        default: [{
            title: 'to do',
            taskCount: 0
        },{
            title: 'in progress',
            taskCount: 0
        },{
            title: 'completed',
            taskCount: 0
        }]
    }
});

const Column = mongoose.model('Column', ColumnSchema);

module.exports = Column;