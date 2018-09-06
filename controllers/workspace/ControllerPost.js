const moment = require('moment');
const Group = require('../../models/group')
const User = require('../../models/user');
const Workspace = require('../../models/workspace');
const Post = require('../../models/post');
const sendMail = require('../../sendgrid/sendMail');
const sendErr = require('../../helpers/sendErr');

/*	==================
 *	-- POST METHODS --
 *	==================
 */

const addNewPost = async (req, res, next) => {
	try { 
		const postData = req.body;

		// Id it's event post, convert due_to date to UTC before storing 
		if (postData.type === 'event') {
			postData[`event.due_to`] = moment.utc(postData[`event.due_to`]).format();
		// Id it's event post, convert due_to date to UTC, and set hours to 20:00 before storing 
		} else if (postData.type === 'task') { 
			postData[`task.due_to`] = moment.utc(postData[`task.due_to`]).hours(20).minutes(0).seconds(0).milliseconds(0).format();
		}

		const post = await Post.create(postData);

		// Send Email notification after post creation
		switch(post.type) {
			case 'task':
				sendMail.taskAssigned(post);
			case 'event':
				sendMail.eventAssigned(post);
		};

		return res.status(200).json({
			message: 'New post created!',
			post,
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const completePost = async (req, res, next) => {
	try {
		let postId = req.body.post_id;

		const post = await Post.findByIdAndUpdate({
			_id: postId
		}, {
			completed: true,
			completion_date: moment().format()
		}, {
			new: true
		});

		return res.status(200).json({
			message: 'Post completed!',
			post,
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const deletePost = async (req, res, next) => {
	try {
		const postId = req.body.postId;

		const post = await Post.findByIdAndRemove({ _id: postId });

		return res.status(200).json({
			message: 'Post deleted!',
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const editPost = async (req, res, next) => {
	try {
		const postId = req.body.post_id;
		const updatedContent = req.body.content;

		const post = await Post.findByIdAndUpdate({
			_id: postId
		}, { 
			$set : {
				content: updatedContent
			}
		}, {
			new: true
		});

		return res.status(200).json({
			message: 'Post updated!',
			post,
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const addCommentOnPost = async (req, res, next) => {
	try {
		const postId = req.body.post_id;
		const commentedBy = req.body._commented_by;
		const content = req.body.content;

		const user = await User.findById({ _id: commentedBy });

		const post = await Post.findByIdAndUpdate({
			_id: postId
		}, {
			$push: {
				comments: {
					content: content,
					_commented_by: user
				}
			},
			$inc: {
				comments_count: 1
			},
		}, {
			new: true
		});

		return res.status(200).json({
			message: 'Comment added!',
			post,
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const getGroupPosts = async (req, res, next) => {
	try {
		const groupId = req.params.group_id;

		const posts = await Post.find({
			_group: groupId
		})
			.sort('-created_date')
			.populate('_posted_by', 'first_name last_name profile_pic')
			.populate('comments._commented_by', 'first_name last_name profile_pic')
			.populate('task._assigned_to', 'first_name last_name')
			.populate('event._assigned_to', 'first_name last_name')
			.populate('_liked_by', '_id first_name last_name').lean();

		const postsUpdate = await posts.map((post) => {
			post.liked_by = post._liked_by.map(user => user._id);
			return post;
		});

		return res.status(200).json({
			message: `Found ${posts.length} posts!`,
			posts: postsUpdate
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const getUserOverview = async (req, res, next) => {
	try {
		const userId = req.params.user_id;

		// Generate the actual time in utc format 
		const now = moment.utc().hours(0).minutes(0).seconds(0).milliseconds(0).format();

		// Generate the +48h time un utc format
		const nowPlus48 = moment.utc().add(48, 'hours').format();

		const posts = await Post.find({
			$or: [
				// From this user...
				{ $and: [
					// Find normal posts that has comments
					{ _posted_by: userId },
					{ type: 'normal' },
					{ comments: { $exists: true, $ne: []}}
				]},
				// Find tasks due to today
				{ $and: [
					{ 'task._assigned_to': userId },
					{ 'task.due_to': { $gte: now, $lt: nowPlus48 }}
				]},
				// Find events due to today
				{ $and: [
					{ 'event._assigned_to': userId },
					{ 'event.due_to': { $gte: now, $lt: nowPlus48 }}
				]}
			]})
			.sort('event.due_to task.due_to -comments.created_date')
			.populate('_posted_by', 'first_name last_name profile_pic')
			.populate('comments._commented_by', 'first_name last_name profile_pic')
			.populate('task._assigned_to', 'first_name last_name')
			.populate('event._assigned_to', 'first_name last_name')
			.populate('_group', 'group_name group_avatar')
			.populate('_liked_by', 'first_name last_name');

		return res.status(200).json({
			message: `Found ${posts.length} posts!`,
			posts,
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const likePost = async (req, res, next) => {
	try {
		const postId = req.body.post_id;
		const userId = req.body.user_id;

		const post = await Post.findByIdAndUpdate({
			_id: postId
		}, {
			$addToSet: {
				_liked_by: userId
			}
		}, {
			new: true
		});

		return res.status(200).json({
			message: 'Post liked!',
			post,
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const unlikePost = async (req, res, next) => {
	try {
	const postId = req.body.post_id;
	const userId = req.body.user_id;

	const post = await Post.findByIdAndUpdate({
		_id: postId
	}, {
		$pull: {
			_liked_by: userId
		}
	}, {
		new: true
	});

		return res.status(200).json({
			message: 'Post unliked!',
			post,
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

/*	=============
 *	-- EXPORTS --
 *	=============
 */

module.exports = {
	addNewPost,
	completePost,
	deletePost,
	editPost,
	addCommentOnPost,
	getGroupPosts,
	getUserOverview,
	likePost,
	unlikePost
};

