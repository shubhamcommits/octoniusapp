import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const CustomFieldSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    values: {
        type: [String],
        required: true,
        default: []
    }
});

const CustomField = mongoose.model('CustomField', CustomFieldSchema);

export { CustomField };
