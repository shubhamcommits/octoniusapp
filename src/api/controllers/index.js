const auths = require('./auths.controller');
const files = require('./files.controller');
const groups = require('./groups.controller');
const posts = require('./posts.controller');
const users = require('./users.controller');
const workspaces = require('./workspaces.controller');

// !! old Controllers, to be removed after implementation
const postsController = require('./posts.controller.old');

module.exports = {
  // !! old Controllers, to be removed after implementation
  postsController,
  // Controllers
  auths,
  files,
  groups,
  posts,
  users,
  workspaces
};
