const Auth = require('./auth.model');
const Comment = require('./comment.model');
const Group = require('./group.model');
const Notification = require('./notification.model');
const Post = require('./post.model');
const User = require('./user.model');
const Workspace = require('./workspace.model');
const StripeCustomer = require('./stripecustomer.model');

module.exports = {
  Auth,
  Comment,
  Group,
  Notification,
  Post,
  User,
  StripeCustomer,
  Workspace
};
