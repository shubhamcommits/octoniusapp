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

const addNewUsersInGroup = async (req, res, next) => {
	try {
		const group = req.body.group;
		const members = req.body.members;
		const adminId = req.params.userId;

		const _members = members.map(result => result._id);

		console.log(_members);

		const groupUpdate = await Group.findByIdAndUpdate({
			_id: group
		}, {
			$addToSet: {
				_members: _members
			}
		}, {
			new: true
		});

		const usersUpdate = await User.updateMany({
			_id: _members
		}, {
			$addToSet: {
				_groups: group
			}
		});

		// Send email to each user, welcoming to the group
		for (let member of _members) {
			const user = await User.findById({ _id: member });
			sendMail.joinedGroup(user, groupUpdate, adminId);
		}

		return res.status(200).json({
			message: 'Group Data has updated successfully!',
			group: groupUpdate
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const updateGroup = async (req, res, next) => {
	try {
		const groupId = req.params.group_id;
		const data = req.body;

		const groupUpdate = await Group.findOneAndUpdate({
			_id: groupId
		}, {
			$set: data
		}, {
			new: true
		});

		if (!groupUpdate) {
			return sendErr(res, err, 'Group not found, invalid group id!', 404)
		}

		return res.status(200).json({
			message: `${groupUpdate.group_name} group was updated successfully!`,
			group: groupUpdate
		});

	} catch (err) {
		return sendErr(res, err);
	}
};

const removeUserFromGroup = async (req, res, next) => {
	try {
		const groupId = req.body.group_id;
		const userId = req.body.user_id;

		// Remove user id from group users 
		const groupUpdate = await Group.findOneAndUpdate({
			_id: groupId
		}, {
			$pull: { _members: user_id, _admins: user_id }
		}, {
			new: true
		});

		// Remove group id from user groups
		const userUpdate = await User.findOneAndUpdate({
			_id: userId
		}, {
			$pull: { _groups: groupId }
		}, {
			new: true
		});

		// If group wasn't found or user wasn't found return invalid id error
		if (!groupUpdate || !userUpdate) {
			let msg;
			!groupUpdate ? msg = 'Group' : msg = 'User';
			return sendErr(res, err, `${msg} not found, invalid id!`, 404)
		}

		return res.status(200).json({
			message: `User has been removed from ${groupUpdate.group_name} group.`,
			group: groupUpdate
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
	searchGroupUsers,
	getUserGroup,
	addNewUsersInGroup,
	updateGroup,
	removeUserFromGroup
};

