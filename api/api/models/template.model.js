const moment = require('moment');
const mongoose = require('mongoose');

// const { Group, Workspace } = require('./');

const { Schema } = mongoose;

const TemplateSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true,
    },
    groupId: {
        type: String,
        required: true
    }
});

const Template = mongoose.model('template', TemplateSchema);

module.exports = Template;
