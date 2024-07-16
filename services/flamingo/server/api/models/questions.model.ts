const { DateTime } = require("luxon");
import mongoose from 'mongoose';

const { Schema } = mongoose;

const QuestionSchema = new Schema({
    type: {
        type : String,
        required: true,
        enum: ['Welcome', 'Thanks', 'ShortText', 'Yes/No', 'Scale', 'Dropdown', 'Multiple']
    },
    text: {
        type : String,
    },
    secondary_text: {
        type : String,
    },
    positive_option_text: {
        type : String,
    },
    negative_option_text: {
        type : String,
    },
    options: [{
        type: String
    }],
    scale: {
        size:{
            type: Number
        },
        left_side_label : {
            type: String
        },
        center_label:{
            type: String
        },
        right_side_label: {
            type: String
        }
    },
    show_scale_labels:{
        type: Boolean,
        default: false
    },
    mandatory:{
        type: Boolean,
        default: false
    },
    image_url: {
        type: String
    },
    background_color: {
        type: String
    },
    text_color: {
        type: String
    },
    created_date: {
        type: Date,
        default: DateTime.now()
    }
});

const Question = mongoose.model('Question', QuestionSchema);

export { Question };
