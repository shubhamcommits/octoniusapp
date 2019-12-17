const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const { Schema } = mongoose;

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
    const userId = req.body.user_id;

    //if user was kicked out 
    const user = await User.findOneAndUpdate({
      $and:[{
        email: invitedUserEmail,
        _workspace: workspaceId,
        active:false,
      }]

    }, {
      $set: {
        active: true
      }
    });

    if(user){
      const globalGroupUpdate = await Group.findOneAndUpdate({
        group_name: 'Global',
        _workspace: workspaceId
      }, {
        $push: {
          _members: user._id
        }
      });
  
      // Error updating the Global group
      if (!globalGroupUpdate) {
        return sendErr(res, '', 'Some error ocurred trying to update the Global group!');
      }
      const workspaceUpdate = await Workspace.findByIdAndUpdate({
        _id: workspaceId
      }, {
        $push: {
          members: user
        },
      }, {
        new: true
      });
  
      // Error updating the Workspace
      if (!workspaceUpdate) {
        return sendErr(res, '', 'Some error ocurred trying to update the Workspace!');
      }
      const userUpdate = await User.findByIdAndUpdate({
        _id: user._id
      }, {
        $push: {
          _groups: globalGroupUpdate
        }
      }, {
        new: true
      });
  
      // Error updating the user
      if (!userUpdate) {
        return sendErr(res, '', 'Some error ocurred trying to update the user!');
      }
    }else{
      // else this is a new member invite 
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
      }
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
      message: `${workspace.workspace_name} workspace was updated!`,
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

    const workspace = await Workspace
    .findOne({
      _id: workspaceId
    })  
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

const getWorkspaceDetails = async (workspaceId) => {
  try {
    
    const workspace = await Workspace.findOne({
      _id: workspaceId
    }).lean()

    return workspace;

  } catch (err) {
    return err;
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

const getUserGroupsQuery = async (req, res, next) => {
  try {
    const {userId, workspaceId} = req.params

    const userGroupsQuery = await Group.find({
      _workspace: workspaceId,
      $or: [{
        _members: userId
      }, {
        _admins: userId
      }],
      type: { $ne: 'smart' },
      group_name: {$ne: 'private'}
    }).sort('_id')
      .limit(11)
      .populate('_members');


      var moreUsersToLoad = false;
      if (userGroupsQuery.length == 11){
        userGroupsQuery.pop()
        moreUsersToLoad = true;
      }

    if (!userGroupsQuery) {
      return sendErr(res, err, 'Invalid workspace id, or user id!', 404);
    }

    return res.status(200).json({
      message: `${userGroupsQuery.length} groups found.`,
      groups: userGroupsQuery,
      moreToLoad: moreUsersToLoad,
    });
  } catch (err) {
    return sendErr(res, err);
  }
};
const getNextUserGroupsQuery = async (req, res, next) => {
  try {
    const {userId, workspaceId,nextQuery} = req.params
    const userNextGroupsQuery = await Group.find({
      _workspace: workspaceId,
      $or: [{
        _members: userId
      }, {
        _admins: userId
      }],
      type: { $ne: 'smart' },
      group_name: {$ne: 'private'},
      _id: {$gt : nextQuery}
    }).sort('_id')
      .limit(6)
      .populate('_members');


      var moreUsersToLoad = false;
      if (userNextGroupsQuery.length == 6){
        userNextGroupsQuery.pop()
        moreUsersToLoad = true;
      }

    if (!userNextGroupsQuery) {
      return sendErr(res, err, 'Invalid workspace id, or user id!', 404);
    }

    return res.status(200).json({
      message: `${userNextGroupsQuery.length} groups found.`,
      groups: userNextGroupsQuery,
      moreToLoad: moreUsersToLoad,
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
  getWorkspaceDetails,
  searchWorkspaceUsers,
  // groups
  createNewGroup,
  getUserGroups,
  getUserGroupsQuery,
  getNextUserGroupsQuery
};
