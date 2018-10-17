const { User, Workspace } = require('../models');
const { sendErr } = require('../../utils');

/*  =============================
 *  -- WORKSPACE ADMIN METHODS --
 *  =============================
 */

// -| Workspace domains controllers |-

const addDomain = async (req, res, next) => {
  try {
    // Add new domains, prevent to add duplicate values
    const workspace = await Workspace.findByIdAndUpdate({
      _id: req.params.workspaceId,
      _owner: req.userId
    }, {
      $addToSet: {
        allowed_domains: req.body.domain
      }
    }, {
      new: true
    });

    if (!workspace) {
      return sendErr(res, '', 'Invalid workspace id or user in not the workspace owner', 404);
    }

    return res.status(200).json({
      message: "New domain was added to workspace's allowed domains!",
      allowedDomains: workspace.allowed_domains
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const deleteDomain = async (req, res, next) => {
  try {
    const { userId, params: { workspaceId, domain } } = req;

    // Remove domain from domains array
    const workspace = await Workspace.findByIdAndUpdate({
      _id: workspaceId,
      _owner: userId
    }, {
      $pull: {
        allowed_domains: domain
      }
    }, {
      new: true
    })
      .lean();

    if (!workspace) {
      return sendErr(res, '', 'Invalid workspace id or user in not the workspace owner', 404);
    }

    // Disable all users from that domain
    const disabledUsers = await User.updateMany({
      workspace_name: workspace.workspace_name,
      email: { $regex: domain, $options: 'i' }
    }, {
      $set: { active: false }
    });

    // Delete all users from that domain, from workspace users/admins/members
    const membersToRemove = await User.find({
      workspace_name: workspace.workspace_name,
      email: { $regex: domain, $options: 'i' }
    }, {
      first_name: 1,
      email: 1
    })
      .lean();

    // LOG TO REMOVE
    console.log(membersToRemove);

    const idsToRemove = [];

    for (let member of membersToRemove) {
      idsToRemove.push(member._id);
    }

    // LOG TO REMOVE
    console.log(idsToRemove);

    const workspaceUpdated = await Workspace.findByIdAndUpdate({
      _id: workspaceId,
      _owner: userId
    }, {
      $pullAll: {
        members: idsToRemove
      }
    }, {
      new: true
    })
      .lean();

    return res.status(200).json({
      message: 'Domain removed from workspace. All users from this domain are disabled!',
      allowedDomains: workspaceUpdated.allowed_domains,
      disabledUsers
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getDomains = async (req, res, next) => {
  try {
    const workspace = await Workspace.find({ _id: req.params.workspaceId });

    if (!workspace) {
      return sendErr(res, '', 'Invalid workspace id!', 404);
    }

    return res.status(200).json({
      message: `Found ${workspace.allowed_domains.length} domains allowed on this workspace!`,
      allowedDomains: workspace.allowed_domains
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
  // domains
  addDomain,
  deleteDomain,
  getDomains
};
