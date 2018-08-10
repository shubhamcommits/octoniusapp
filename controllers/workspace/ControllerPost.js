const Group = require('../../models/group')
const User = require('../../models/user');
const Workspace = require('../../models/workspace');
const Post = require('../../models/post');
const sendMail = require("../../sendgrid/sendMail");

module.exports = {

	addNewPost(req, res, next) {
		console.log(`--> Creating new ${req.body.type} post...`);

		const post_data = req.body;
		const post_created;

		Post.create(post_data)
			.then((post) => {

				post_created = post;

				return res.status(200).json({
					message: "post has been added successfully",
					post: post
				});
			})
			.then(() => {
				console.log('--> ...post has been created!')

				// Send Email notification
				switch(post_created.type) {
					case 'task':
						sendMail.taskAssigned(post_created);
					case 'event':
						// sendMail.eventAssigned(post_created);
				};
			})
			.catch((err) => res.status(500).json({
				message: "something went wrong | internal server error",
				err
			}))
	},

	completePost(req, res, next) {

		let post_id = req.body.post_id;
		let user_id = req.body.user_id;

		Post.findByIdAndUpdate({
			_id: post_id
		}, {
			completed: true,
			completion_date: new Date()
		}, {
			new: true
		})
			.then((updated_post) => {
				res.status(200).json({
					message: "Post has been completed Successfully!",
					post: updated_post
				})
			})
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong | internal server error ",
					err
				})
			});
	},

	deletePost(req, res, next) {

		let postId = req.body.postId;

		Post.findByIdAndRemove({
			_id: postId
		})
			.then((deletedPost) => {
				res.status(200).json({
					message: "post has been deleted successfully!",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong on server | mongdb server error",
					err
				});
			});
	},

	editPost(req, res, next) {

		const post_id = req.body.post_id;
		const updatedContent = req.body.content;

		Post.findByIdAndUpdate({
			_id: post_id
		}, { 
			$set : {
				content: updatedContent
			}
		}, {
			new: true
		})
			.then((updated_post) => {
				res.status(200).json({
					message: "Post updated!",
					post: updated_post
				})
			})
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong | internal server error ",
					err
				})
			});
	},

	addCommentOnPost(req, res, next) {

		let post_id = req.body.post_id;
		let _commented_by = req.body._commented_by;
		let content = req.body.content;

		User.findById({
			_id: _commented_by
		}).then((user) => {
			Post.findByIdAndUpdate({
				_id: post_id
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
			})
				.then((post) => {
					res.status(200).json({
						message: "comment added on post successfully",
						post: post
					});
				})
				.catch((err) => {
					res.status(500).json({
						message: "something went wrong | internal server error",
						error: err
					});
				})
		})
			.catch((err) => res.status(500).json({
				message: "something went wrong | internal server error",
				error: err
			}))
	},

	getGroupPosts(req, res, next) {
		const group_id = req.params.group_id;

		Post.find({
			_group: group_id
		})
			.sort('-created_date')
			.populate('_posted_by', 'first_name last_name profile_pic')
			.populate('comments._commented_by', 'first_name last_name profile_pic')
			.populate('task._assigned_to', 'first_name last_name')
			.then((posts) => res.status(200).json({
				message: "posts found successfully!",
				posts: posts
			}))
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong | internal server error ",
					err
				})
			})
	},

	likePost(req, res, next) {

		let post_id = req.body.post_id;
		let user_id = req.body.user_id;

		Post.findByIdAndUpdate({
			_id: post_id
		}, {
			$addToSet: {
				_liked_by: user_id
			}
		}, {
			new: true
		})
			.then((updated_post) => {
				res.status(200).json({
					message: "Post has been liked Successflly!",
					post: updated_post
				})
			})
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong | internal server error ",
					err
				})
			})
	},

	unlikePost(req, res, next) {

		let post_id = req.body.post_id;
		let user_id = req.body.user_id;

		Post.findByIdAndUpdate({
			_id: post_id
		}, {
			$pull: {
				_liked_by: user_id
			}
		}, {
			new: true
		}).then((updated_post) => {
			res.status(200).json({
				message: "post successfully unliked",
				post: updated_post
			});
		}).catch((err) => {
			res.status(500).json({
				message: "something went wrong on server | mongdb server error",
				err
			});
		})
	}
}
