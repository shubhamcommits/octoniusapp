const Wrokspace = require("../../models/workspace");
const User = require("../../models/user");
const Post = require("../../models/post");
const sendMail = require("../../sendgrid/sendMail");
const defaults = require("../../sendgrid/defaults");

module.exports = {


	updateAllowedEmailDomains(req, res, next) {
		let workspace_id = req.body.workspace_id;
		let allowed_domains = req.body.domains.split(',').map(function (e) {
			return e.trim();
		});
		// adding new doamins and preventing to add duplicate values
		Wrokspace.findByIdAndUpdate({
			_id: workspace_id
		}, {
			$addToSet: {
				allowed_domains: allowed_domains
			}
		}, {
			new: true
		})
			.then((updated_workspace) => {

				if (updated_workspace == null) {
					res.status(404).json({
						message: "Invalid workspace id error,workspace not found.",
					});
				} else {
					res.status(200).json({
						message: "Domains data has Updated successfully",
						doamins: allowed_domains
					})
				}
			})
			.catch((error) => {

				res.status(500).json({
					message: "something went wrong | internal server error",
					error
				})

			})
	},

	inviteUserViaEmail(req, res, next) {

		let workspace_id = req.body.workspace_id;
		let invited_user_email = req.body.email;

		Wrokspace.findByIdAndUpdate({
			_id: workspace_id
		}, {
			$push: {
				invited_users: {
					email: invited_user_email,
				}
			}
		}, {
			new: true
		})
			.then((updated_workspace) => {
				if (updated_workspace == null) {
					res.status(404).json({
						message: "Error! workspace not found, invalid workspace id"
					});
				} else {
					// Send invitation via email
					sendMail.joinWorkspace(req.body);
				}
			})
			.catch((err) => {
				res.status(500).json({
					message: "soemthing went wrong | internal server error!",
					err
				})
			})

	},

	updateUserRole(req, res, next) {
		let user_id = req.body.user_id;
		let role = req.body.role;

		User.findByIdAndUpdate({
			_id: user_id
		}, {
			role: role
		}, {
			new: true
		})
			.then((user) => {
				res.status(200).json({
					message: "User role has been updated successfully!",
				});

			})
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong | internal server error",
					err
				});
			})

	},

	removeUserFromWorkspace(req, res, next) {

		// remove user from workspace
		// remove user from all groups
		// keep the user data, but remove his email address
		// make the user blocked
		//
		let user_id = req.body.user_id;
		Post.remove({
			_posted_by: user_id
		})
			.then((res) => {
				res.status(200).json({
					message: "posts removed successfully!",
					err
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "something went wrong | internal server error",
					err
				});

			})

	},

	updateWorkspace(req, res, next) {
		let workspace_id = req.params.workspace_id;
		let data = req.body;

		Wrokspace.findOneAndUpdate({
			_id: workspace_id
		}, {
			$set: data
		}, {
			new: true
		})
			.then((updated_workspace) => {
				res.status(200).json({
					message: "Workspace has been updated successfully!",
				});
			})
			.catch((err) => {
				res.status(500).json({
					message: "Something went wrong | internal server error!",
					err
				});
			})

	}
}
