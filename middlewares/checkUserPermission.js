const Post = require('../models/post');

module.exports = { 

	toEditPost(req, res, next) {

		console.log('--> Checking user permisson...');

		Post.findById(req.body.post_id, (err, foundPost) => {
			if (err || !foundPost) {
				console.log('--> There was an error trying to find the post: \n', err);
			} else {
				if (foundPost._posted_by.equals(req.body.user_id)) {
					console.log('--> OK!');
					next();
				} else {
					console.log('--> Attention: Unauthorized user tried to acess this API!');
					res.redirect('back');
				}
			}
		});
	},

	toCompletePost(req, res, next) {

		console.log('--> Checking user permisson...');

		Post.findById(req.body.post_id, (err, foundPost) => {
			if (err || !foundPost) {
				console.log('--> There was an error trying to find the post: \n', err);
			} else {

				if ( 
					// Check if user is the post owner or
					foundPost._posted_by.equals(req.body.user_id) ||
					( // check if post type is 'event' and...
						(foundPost.type === 'event' &&
							//  ...the event is assigned to this user... or...
							foundPost.event._assigned_to.includes(String(req.body.user_id))) ||
						// check if post type is 'task' and...
						(foundPost.type === 'task' &&
							// ...the task is assigned to this user.
							foundPost.task._assigned_to.equals(req.body.user_id)) 
					)
				) {
					console.log('--> OK!');
					next();
				} else {
					console.log('--> Attention: Unauthorized user tried to acess this API!');
					res.redirect('back');
				}
			}
		});
	},

};

