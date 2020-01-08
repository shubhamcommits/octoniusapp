const authsRoutes = require('./auths.routes');
const groupsRoutes = require('./groups.routes');
const postsRoutes = require('./posts.routes');
const usersRoutes = require('./users.routes');
const workspacesRoutes = require('./workspaces.routes');
const billingRoutes = require('./billing.routes');
const webhooksRoutes = require('./webhooks.routes');
const searchRoutes = require('./search.routes');
const columnsRoutes = require('./columns.routes');
const documentFileRoutes = require('./document-file.routes');
const groupFileSectionRoutes = require('./group-file-uploads.routes');
const templateRoutes = require('./template.routes');
const followerRoutes = require('./follower.routes');
const externalRoutes = require('./external.routes');


module.exports = {
  authsRoutes,
  billingRoutes,
  groupsRoutes,
  postsRoutes,
  searchRoutes,
  usersRoutes,
  webhooksRoutes,
  workspacesRoutes,
  columnsRoutes,
  documentFileRoutes,
  groupFileSectionRoutes,
  templateRoutes,
  followerRoutes,
  externalRoutes
};
