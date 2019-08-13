const { Group, User } = require('../models');
const { sendErr, sendMail } = require('../../utils');

/*  ===================
 *  -- GROUP METHODS --
 *  ===================
 */

const getAllGroupUsers = async (req, res, next) => {
  try {
    const group = req.params.group_id;

    const users = await User.find({
      _groups: group
    });


    return res.status(200).json({
      message: `Found ${users.length} users!`,
      users
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const searchGroupUsers = async (req, res, next) => {
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

const addNewUsersInGroup = async (req, res, next) => {
  try {
    const group = req.body.group;
    const members = req.body.members;
    const adminId = req.userId;

    const _members = members.map(result => result._id);

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
    for (let memberId of _members) {
      sendMail.joinedGroup(memberId, groupUpdate, adminId);
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
      $pull: { _members: userId, _admins: userId }
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
      groupUpdate ? msg = 'Group' : msg = 'User';
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

/*  =============
 *  -- EXPORTS --
 *  =============
 */

module.exports = {
  getAllGroupUsers,
  searchGroupUsers,
  addNewUsersInGroup,
  updateGroup,
  removeUserFromGroup
};
