import moment from 'moment';
import mongoose from 'mongoose';

const { Schema } = mongoose;

const PortfolioSchema = new Schema({
    portfolio_name: {
        type: String,
        required: true,
        trim: true
    },
    portfolio_avatar: {
        type: String,
        default: 'assets/images/icon-new-group.svg'
    },
    description: {
        type: String,
        default: null
    },
    _groups: [{
        type: Schema.Types.ObjectId,
        ref: 'Group'
    }],
    _members: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    selected_widgets: {
        type: [String],
        enum: ['WORK_STATISTICS', 'WORKLOAD', 'VELOCITY', 'ENGAGEMENT', 'KPI_PERFORMANCE', 'RESOURCE_MANAGEMENT', 'CF_TABLE', 'TOP_SOCIAL']
    },
    background_color: {
        type: String
    },
    background_image: {
        type: String
    },
    content: {
        type: String,
        trim: true
    },
    _content_mentions: [{
        type: Schema.Types.Mixed,
        ref: 'User'
    }],
    dashboard_period: {
        type: Number,
        default: 7
    },
    _created_by: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    created_date: {
        type: Date,
        default: moment().format()
    }
});

const Portfolio = mongoose.model('Portfolio', PortfolioSchema);

export { Portfolio }
