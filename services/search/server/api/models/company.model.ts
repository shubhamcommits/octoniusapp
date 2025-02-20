const { DateTime } = require("luxon");
import mongoose from "mongoose";

const { Schema } = mongoose;

const CompanySchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: false,
    },
    company_pic: {
        type: String,
        default: "assets/images/icon-new-group.svg",
    },
    _group: {
        type: Schema.Types.ObjectId,
        ref: "Group",
        required: false,
    },
    _workspace: {
        type: Schema.Types.ObjectId,
        ref: "Workspace",
        required: true,
    },
    // Custom Fields
    crm_custom_fields: {
        type: Map,
        of: String,
    },
    tasks: [
        {
            description: {
                type: String,
            },
            date: {
                type: Date,
                default: DateTime.now(),
            },
            completed: {
                type: Boolean,
                default: false,
                required: true,
            },
            _assigned_to: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: false,
                    default: [],
                },
            ],
            _created_user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
        },
    ],
    updates: [
        {
            description: {
                type: String,
            },
            date: {
                type: Date,
                default: DateTime.now(),
            },
            _created_user: {
                type: Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            _assigned_to: [
                {
                    type: Schema.Types.ObjectId,
                    ref: "User",
                    required: false,
                    default: [],
                },
            ]
        },
    ],
});

const Company = mongoose.model("Company", CompanySchema);

export { Company };
