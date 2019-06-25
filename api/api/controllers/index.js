const auths = require('./auths.controller');
const groups = require('./groups.controller');
const notifications = require('./notifications.controller');
const posts = require('./posts.controller');
const users = require('./users.controller');
const workspaces = require('./workspaces.controller');
const billing = require('./billing.controller');
const search = require('./search.controller');
const columns = require('./columns.controller');

// !! old Controllers, to be removed after implementation
const authsController = require('./auths.controller.old');
const groupsController = require('./groups.controller.old');
const workspacesController = require('./workspaces.controller.old');

module.exports = {
  // !! Old Controllers, to be removed after implementation.
  authsController,
  groupsController,
  workspacesController,
  // Controllers
  auths,
  billing,
  groups,
  notifications,
  posts,
    search,
  users,
  workspaces,
  columns
};
