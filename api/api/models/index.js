const Auth = require('./auth.model');
const Comment = require('./comment.model');
const Document = require('./document.model');
const DocumentEditHistory = require('./documentedithistory.model');
const DocumentAuthor = require('./documentAuthor.model');
const Group = require('./group.model');
const Notification = require('./notification.model');
const Post = require('./post.model');
const User = require('./user.model');
const Workspace = require('./workspace.model');
const StripeCustomer = require('./stripecustomer.model');
const Resetpwd = require('./resetpwd.model');

module.exports = {
  Auth,
  Comment,
  Document,
  DocumentEditHistory,
  DocumentAuthor,
  Group,
  Notification,
  Post,
  User,
  Resetpwd,
  StripeCustomer,
  Workspace
};
