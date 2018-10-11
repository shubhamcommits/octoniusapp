const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { Auth, Group, User, Workspace } = require('../models');
const { password, sendMail, sendErr } = require('../../utils');

/*  =============================
 *  -- WORKSPACE ADMIN METHODS --
 *  =============================
 */

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
  // TO DO !!!

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
