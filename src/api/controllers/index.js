const auths = require('./auths.controller');
const groups = require('./groups.controller');
const posts = require('./posts.controller');
const users = require('./users.controller');
const workspaces = require('./workspaces.controller');

// !! old Controllers, to be removed after implementation
const authsController = require('./auths.controller.old');
const groupsController = require('./groups.controller.old');
const postsController = require('./posts.controller.old');
const usersController = require('./users.controller.old');
const workspacesController = require('./workspaces.controller.old');

module.exports = {
  // !! Old Controllers, to be removed after implementation
  authsController,
  groupsController,
  postsController,
  usersController,
  workspacesController,
  // Controllers
  auths,
  groups,
  posts,
  users,
  workspaces
};
