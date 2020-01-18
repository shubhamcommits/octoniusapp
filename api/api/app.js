const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
const path = require('path');

const devEnv = require('../development.config');

const prodEnv = require('../production.config');

const compression = require('compression');

// Correct REST naming
const {
  authsRoutes,
  billingRoutes,
  columnsRoutes,
  documentFileRoutes,
  externalRoutes,
  followerRoutes,
  groupsRoutes,
  groupFileSectionRoutes,
  postsRoutes,
  pulseRoutes,
  searchRoutes,
  templateRoutes,
  usersRoutes,
  webhooksRoutes,
  workspacesRoutes,
} = require('./routes');

const app = express();


// Load 'development' configs for dev environment
if (process.env.NODE_ENV !== 'production') {
  devEnv.init();
}
else{
  prodEnv.init();
}

// Open Mongoose connection to db
require('../db');

// Start caching logic
require('../utils/cache/cache');

// cors middleware for orign and Headers
app.use(cors());

// Set Bodyparser middleware
app.use(bodyParser.urlencoded({
  extended: true,
  urlencoded: { limit: '50mb', extended: true }
}));
app.use(bodyParser.json({ limit: '50mb', extended: true }));

// Use Morgan middleware for logging every request status on console
app.use(morgan('dev'));

// Set file upload middleware
app.use(fileUpload());
app.use('/uploads', express.static(process.env.FILE_UPLOAD_FOLDER));

// const encodeResToGzip = contentType => (req, res, next) => {
//   req.url = req.url + '.gz';
//   res.set('Content-Encoding', 'gzip');
//   res.set('Content-Type', contentType);

//   next();
// };

// app.get("*.js", encodeResToGzip('text/javascript'));
// app.get("*.css", encodeResToGzip('text/css'));
// app.get("*.html", encodeResToGzip('text/html'));

// static folder
app.use(express.static(path.join(__dirname, '../../client-upgrade/client/dist')));

// Compressing the application
app.use(compression());

// Routes which should handle request
app.all('/', (req, res, next) => {
  res.sendFile(path.join(__dirname, '../../client-upgrade/client/dist/index.html'));
});

// Correct REST naming
app.use('/api/auths', authsRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/pulse', pulseRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/workspaces', workspacesRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/webhooks', webhooksRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/columns', columnsRoutes);
app.use('/api/documentFiles', documentFileRoutes);
app.use('/api/groupFileUploads', groupFileSectionRoutes);

// -->!!!! TO BE REMOVED !!!!
app.use('/api/auth', authsRoutes);
app.use('/api/group', groupsRoutes);
app.use('/api/workspace', workspacesRoutes);

app.use('/api/templates', templateRoutes);
app.use('/api/followers', followerRoutes);

app.use('/api/external', externalRoutes);

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
