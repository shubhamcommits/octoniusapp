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
	}

};

