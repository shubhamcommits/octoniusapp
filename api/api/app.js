const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const path = require('path');

const devEnv = require('../development.config');

// Correct REST naming
const {
  authsRoutes,
  billingRoutes,
  groupsRoutes,
  postsRoutes,
  searchRoutes,
  usersRoutes,
  webhooksRoutes,
  workspacesRoutes
} = require('./routes');

const app = express();


// Load 'development' configs for dev environment
if (process.env.NODE_ENV !== 'production') {
  devEnv.init();
}

// Open Mongoose connection to db
require('../db');

// Start caching logic
require('../utils/cache/cache');

// cors middleware for orign and Headers
app.use(cors());

// Set Bodyparser middleware
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

// Use Morgan middleware for logging every request status on console
app.use(morgan('dev'));

// Set file upload middleware
app.use(fileUpload());
app.use('/uploads', express.static(process.env.FILE_UPLOAD_FOLDER));

// static folder
app.use(express.static(path.join(__dirname, '../../public/dist')));

// Routes which should handle request
app.all('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../../public/dist/index.html'));
});

// Correct REST naming
app.use('/auths', authsRoutes);
app.use('/groups', groupsRoutes);
app.use('/posts', postsRoutes);
app.use('/users', usersRoutes);
app.use('/workspaces', workspacesRoutes);
app.use('/billing', billingRoutes);
app.use('/webhooks', webhooksRoutes);
app.use('/search', searchRoutes);


// -->!!!! TO BE REMOVED !!!!
app.use('/auth', authsRoutes);
app.use('/group', groupsRoutes);
app.use('/workspace', workspacesRoutes);

// Invalid routes handling middleware
app.use((req, res, next) => {
  const error = new Error('404 not found');
  next(error);
});

// Error handling middleware
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message
    }
  });
});

module.exports = app;
