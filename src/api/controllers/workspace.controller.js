const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Auth, Group, User, Workspace } = require('../models');
const { password, sendMail, sendErr } = require('../../utils');

/*  =============================
 *  -- WORKSPACE ADMIN METHODS --
 *  =============================
 */

const updateAllowedEmailDomains = async (req, res, next) => {
  // - create 2 routes: GET domains, POST removeDomain, POST addDomain
  try {
    const workspaceId = req.body.workspace_id;
    const allowedDomains = req.body.domains.split(',').map(e => e.trim());

    // Add new domains, prevent to add duplicate values
    const workspace = await Workspace.findByIdAndUpdate({
      _id: workspaceId
    }, {
      $addToSet: {
        allowed_domains: allowedDomains
      }
    }, {
      new: true
    });

    if (!workspace) {
      return sendErr(res, '', 'Please enter a valid workspace id', 404);
    };

    return res.status(200).json({
      message: `Workspace's allowed domains updated!`,
      // !!! PREVENT ERROR !!! FrontEnd Error prevention: property was named by 'doamins' 
      allowedDomains,
    });

  } catch (err) {
    return sendErr(res, err);
  }
};

const inviteUserViaEmail = async (req, res, next) => {
  try {
    const workspaceId = req.body.workspace_id;
    const invitedUserEmail = req.body.email;

    const workspace = await Workspace.findByIdAndUpdate({
      _id: workspaceId
    }, {
      // !!REFACTOR THIS, WHILE IT'S NOT IN SYNC WITH SIGNUP METHOD
      $push: {
        invited_users: invitedUserEmail,
      }
    }, {
      new: true
    });

    if (!workspace) {
      return sendErr(res, '', 'Please enter a valid workspace id', 404);
    };

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
      role: role
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

const removeUserFromWorkspace = async (req, res, next) => {
  try {
    const workspaceName = req.body.workspace_name;
    const userId = req.body.user_id;

    // Remove user from workspace members (and from invited users list)
    const workspace = await Workspace.findOneAndUpdate({
      workspace_name: workspaceName
    }, {
      $pull: { members: userId, invited_users: userId }
    }, {
      new: true
    });

    // Remove user from all groups _members , _admins 
    const group = await Group.update({ $or: {
      _members: userId,
      _admins: userId
    }}, {
      $pull: { _members: user_id, _admins: user_id }
    }, {
      multi: true,
    });

    // Disable user
    const user = await User.findByIdAndUpdate({
      _id: userId
    }, {
      $set: {
        active: false
      }
    }, {
      new: true
    });

    return res.status(200).json({
      message: `User ${user.fisrt_name} was removed from workspace!`,
      workspace
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
      .populate('members', 'first_name last_name role profile_pic email');

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

    return  res.status(200).json({
      message: 'Users found!',
      users,
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

    if (!!groupExist) {
      return sendErr(res, err, 'Group name already taken, please choose another name!', 409);
    } else {
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

      return res.status(200).json({
        message: 'Group Created Successfully!',
        group,
        user
      });
    }

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
        '_members': userId
      }, {
        '_admins': userId
      }]
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
  updateAllowedEmailDomains,
  inviteUserViaEmail,
  updateUserRole,
  removeUserFromWorkspace,
  updateWorkspace,
  // core
  getWorkspace,
  searchWorkspaceUsers,
  // groups
  createNewGroup,
  getUserGroups
};
