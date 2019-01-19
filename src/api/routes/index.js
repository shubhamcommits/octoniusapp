const authsRoutes = require('./auths.routes');
const groupsRoutes = require('./groups.routes');
const postsRoutes = require('./posts.routes');
const usersRoutes = require('./users.routes');
const workspacesRoutes = require('./workspaces.routes');
const billingRoutes = require('./billing.routes');

module.exports = {
  authsRoutes,
  billingRoutes,
  groupsRoutes,
  postsRoutes,
  usersRoutes,
  workspacesRoutes
};
