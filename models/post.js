const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Workspace = require("../models/workspace")
const User = require("../models/user");
const Group = require("../models/group");


const PostSchema = new Schema({

	content: {
		type: String,
		trim: true
	},
	type: {
		type: String,
		required: true,
		enum: ['normal', 'event', 'task']
	},
	likes_count: {
		type: Number,
		default: 0,
	},
	_liked_by: [{
		type: Schema.Types.ObjectId,
		ref: 'User',
	}],
	comments_count: {
		type: Number,
		default: 0,
	},
	comments: [{
		content: {
			type: String,
			default: null
		},
		created_date: {
			type: Date,
			default: Date.now
		},
		_commented_by: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			require: true
		}
	}],
	completed: {
		type:	Boolean,
		default: false
	},
	completion_date: {
		type: Date,
		default: null
	},
	_group: {
		type: Schema.Types.ObjectId,
		ref: 'Group',
		required: true
	},
	_posted_by: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	task: {
		due_date: {
			type: Date,
			default: null
		},
		_assigned_to: {
			type: Schema.Types.ObjectId,
			ref: 'User'
		}
	},
	event: {
		due_date: {
			type: Date,
			default: null
		},
		due_time: {
			type: String,
			default: null
		},
		_assigned_to: [{
			type: Schema.Types.ObjectId,
			ref: 'User'
		}]
	},
	created_date: {
		type: Date,
		default: Date.now,
	},
	files: [{
		orignal_name: {
			type: String,
			default: null
		},
		modified_name: {
			type: String,
			default: null
		}
	}]

});

const Post = mongoose.model('Post', PostSchema);
module.exports = Post;
