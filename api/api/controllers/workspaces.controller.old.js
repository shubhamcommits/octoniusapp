const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const {
  Auth, Group, User, Workspace
} = require('../models');
const { password, sendMail, sendErr } = require('../../utils');

/*  =============================
 *  -- WORKSPACE ADMIN METHODS --
 *  =============================
 */

const inviteUserViaEmail = async (req, res, next) => {
  try {
    const workspaceId = req.body.workspace_id;
    const invitedUserEmail = req.body.email;

    const workspace = await Workspace.findByIdAndUpdate({
      _id: workspaceId
    }, {
      // !!REFACTOR THIS, WHILE IT'S NOT IN SYNC WITH SIGNUP METHOD
      $push: {
        invited_users: invitedUserEmail
      }
    }, {
      new: true
    });

    if (!workspace) {
      return sendErr(res, '', 'Please enter a valid workspace id', 404);
    }

    // Send invitation via email
    await sendMail.joinWorkspace(req.body);

    return res.status(200).json({
      message: `Email invitation sent to ${invitedUserEmail}`
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const updateUserRole = async (req, res, next) => {
  try {
    const userId = req.body.user_id;
    const role = req.body.role;

    const user = await User.findByIdAndUpdate({
      _id: userId
    }, {
      role
    }, {
      new: true
    });

    return res.status(200).json({
      message: `Role updated for user ${user.fisrt_name}`,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const updateWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspace_id;
    const data = req.body;

    const workspace = await Workspace.findOneAndUpdate({
      _id: workspaceId
    }, {
      $set: data
    }, {
      new: true
    });

    return res.status(200).json({
      message: `${workspace.workspaceName} workspace was updated!`,
      workspace
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/*	==========
 *	-- CORE --
 *	==========
 */

const getWorkspace = async (req, res, next) => {
  try {
    const workspaceId = req.params.workspace_id;

    const workspace = await Workspace.findOne({
      _id: workspaceId
    })
      .populate('members', 'first_name last_name role profile_pic email')
      .select('-billing.subscription_id');

    if (!workspace) {
      return sendErr(res, err, 'Workspace not found, provide a valid workspace id!', 404);
    }

    return res.status(200).json({
      message: `${workspace.workspace_name} workspace found!`,
      workspace
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const searchWorkspaceUsers = async (req, res, next) => {
  try {
    const query = req.params.query;
    const workspaceId = req.params.workspace_id;

    const users = await User.find({
      _workspace: workspaceId,
      full_name: {
        $regex: new RegExp(query, 'i')
      }
    })
      .limit(10);

    return res.status(200).json({
      message: 'Users found!',
      users
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

/*	=============
 *	-- GROUP --
 *	=============
 */

const createNewGroup = async (req, res, next) => {
  try {
    const newGroupData = req.body;

    const groupExist = await Group.findOne({
      group_name: newGroupData.group_name,
      _workspace: newGroupData._workspace
    });

    if (groupExist) {
      return sendErr(res, err, 'Group name already taken, please choose another name!', 409);
    }
    const group = await Group.create(newGroupData);
    const user = await User.findByIdAndUpdate({
      _id: newGroupData._admins,
      _workspace: newGroupData._workspace
    }, {
      $push: {
        _groups: group
      }
    }, {
      new: true
    });

    console.log(newGroupData,"brea1",groupExist,"brea3",user,"brea4",group)

    return res.status(200).json({
      message: 'Group Created Successfully!',
      group,
      user
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getUserGroups = async (req, res, next) => {
  try {
    const userId = req.params.user_id;
    const workspaceId = req.params.workspace_id;

    const groups = await Group.find({
      _workspace: workspaceId,
      $or: [{
        _members: userId
      }, {
        _admins: userId
      }],
      type: { $ne: 'smart' }
    })
      .populate('_members');

    if (!groups) {
      return sendErr(res, err, 'Invalid workspace id, or user id!', 404);
    }

    return res.status(200).json({
      message: `${groups.length} groups found.`,
      groups
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
  // admin
  inviteUserViaEmail,
  updateUserRole,
  updateWorkspace,
  // core
  getWorkspace,
  searchWorkspaceUsers,
  // groups
  createNewGroup,
  getUserGroups
};
