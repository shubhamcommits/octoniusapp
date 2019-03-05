const authsRoutes = require('./auths.routes');
const groupsRoutes = require('./groups.routes');
const postsRoutes = require('./posts.routes');
const usersRoutes = require('./users.routes');
const workspacesRoutes = require('./workspaces.routes');
const billingRoutes = require('./billing.routes');
const webhooksRoutes = require('./webhooks.routes');
const searchRoutes = require('./search.routes');

module.exports = {
  authsRoutes,
  billingRoutes,
  groupsRoutes,
  postsRoutes,
    searchRoutes,
  usersRoutes,
  webhooksRoutes,
  workspacesRoutes
};
