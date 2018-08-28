const Group = require('../../models/group');
const User = require('../../models/user');
const sendMail = require('../../sendgrid/sendMail');
const sendErr = require('../../helpers/sendErr');

/*	===================
 *	-- GROUP METHODS --
 *	===================
 */ 

const searchGroupUsers = async (req,res, next) => {
	try {
		const query = req.params.query;
		const group = req.params.group_id;

		const users = await User.find({
			_groups: group,
			full_name: {
				$regex: new RegExp(query, 'i')
			}
		});

		return res.status(200).json({
			message: `Found ${users.length} users!`,
			users
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const getUserGroup = async (req, res, next) => {
	try {
		const groupId = req.params.group_id;

		const group = await Group.findOne({
			_id: groupId
		})
			.populate('_members', 'first_name last_name profile_pic role email')
			.populate('_admins', 'first_name last_name profile_pic role email')

		if (!group) {
			return sendErr(res, err, 'Group not found, invalid group id!', 404)
		}

		return res.status(200).json({
			message: 'Group found!',
			group
		});
	} catch (err) {
		return sendErr(res, err);
	}
};

// STOPPED HERE!!!!!!!!
addNewUsersInGroup(req, res, next) {
	let group = req.body.group;
	let members = req.body.members;
	let _members = members.map(result => {
		return result._id;
	});

	Group.findByIdAndUpdate({
		_id: group
	}, {
		$addToSet: {
			_members: _members
		}
	}, {
		new: true
	})
		.then((updated_group) => {
			User.updateMany({
				_id: _members
			}, {
				$addToSet: {
					_groups: group
				}
			})
				.then((updated_users) => {
					res.status(200).json({
						message: 'Group Data has updated successfully!',
						group: updated_group
					});

				})
				.catch((err) => {
					res.status(500).json({
						message: 'Error! something went wrong | internal server error',
						err
					});
				})
		})
		.catch((err) => {
			res.status(500).json({
				message: 'Error! something went wrong | internal server error',
				err
			});
		})
},

	updateGroup(req, res, next) {
		console.log('===============Update Group===============');
		let group_id = req.params.group_id;
		let data = req.body;

		Group.findOneAndUpdate({
			_id: group_id
		}, {
			$set: data
		}, {
			new: true
		})
			.then((updated_group) => {

				if (updated_group == null) {
					res.status(404).json({
						message: 'Error! group not found,Invalid group id'
					});
				} else {
					res.status(200).json({
						message: 'Group has been updated successfully!',
						group: updated_group
					});
				}

			})
			.catch((err) => {

				res.status(500).json({
					message: 'something went wrong | internal server error!',
					err: err
				});
			})
	},

	removeUserFromGroup(req, res, next) {

		let group_id = req.body.group_id;
		let user_id = req.body.user_id;

		Group.findOneAndUpdate({
			_id: group_id
		}, {
			$pull: { _members: user_id, _admins: user_id }
		}, {
			new: true
		})
			.then((updated_group) => {

				if (updated_group == null) {
					res.status(404).json({
						message: 'Group not found!'
					});
				} else {
					res.status(200).json({
						message: `User has been removed from ${updated_group.group_name} group.`,
						group: updated_group
					});
				}
			})
			.catch((err) => {
				res.status(500).json({
					message: 'Something went wrong | internal server error!',
					err: err
				});
			})
	},

}
