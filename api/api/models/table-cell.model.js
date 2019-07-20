const mongoose = require('mongoose');

const { Schema } = mongoose;

const TableCellSchema = new Schema({
    _post_id: {
        type: Schema.Types.ObjectId
    },
    _cell_id: {
        type: Schema.Types.Mixed
    },
    _color: {
        type: String
    }
});

const TableCell = mongoose.model('Table', TableCellSchema);

module.exports = TableCell;
