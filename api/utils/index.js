// ./
const cleanCache = require('./cache/cleanCache');
const passwordHelper = require('./password');
const sendErr = require('./sendErr');
const socket = require('./socket');

// auth/
const auth = require('./auth/auth');
const authorization = require('./auth/authorization');

// billing/
const billing = require('./billing/billing');

// filehandler/
const fileHandler = require('./filehandlers/filehandler');
const groupFileHandler = require('./filehandlers/group.filehandler');
const postFileHandler = require('./filehandlers/post.filehandler');
const workspaceFileHandler = require('./filehandlers/workspace.filehandler');

// sendmail/
const sendMail = require('./sendmail/sendMail');

// search
const search = require('./search/search');

module.exports = {
  // ./
  cleanCache,
  passwordHelper,
  sendErr,
  socket,

  // auth/
  auth,
  authorization,

  //  billing/
  billing,

  // filehandler/
  fileHandler,
  groupFileHandler,
  postFileHandler,
  workspaceFileHandler,

  // sendmail/
  sendMail,

  //    search
  search
};
