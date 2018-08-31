const Group = require('../../models/group')
const User = require('../../models/user');
const Workspace = require('../../models/workspace');
const Post = require('../../models/post');
const sendMail = require('../../sendgrid/sendMail');
const sendErr = require('../../helpers/sendErr');
const toUTC = require('../../helpers/convertDateToUTC');

/*	==================
 *	-- POST METHODS --
 *	==================
 */

const addNewPost = async (req, res, next) => {
	try { 
		const postData = req.body;

		// Id it's event/task post, convert due_to date to UTC before storing 
		if (postData.type === 'event' || postData.type === 'task') { 
			 postData[`${postData.type}.due_to`] = await toUTC(postData[`${postData.type}.due_to`]);
		}

		const post = await Post.create(postData);

		// Send Email notification after post creation
		switch(post.type) {
			case 'task':
				// sendMail.taskAssigned(post);
			case 'event':
				// sendMail.eventAssigned(post);
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
		
		// REFACTOR THIS FUNCTION AFTER MIGRATE ALL APP DATES TO MOMENT.JS
		// const today = moment().format()(new Number(req.params.today));
		// today.setHours(0,0,0,0);

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
					{ 'task.due_date': today }
				]},
				// Find events due to today
				{ $and: [
					{ 'event._assigned_to': userId },
					{ 'event.due_date': today }
				]}
			]})
			.sort('-created_date')
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

