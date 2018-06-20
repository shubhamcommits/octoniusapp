const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require('mongoose');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
const cors = require('cors');
const app = express();


const apis_workspace = require('./routes/workspace');
const apis_auth = require('./routes/auth');
const apis_user = require('./routes/user');
const apis_post = require('./routes/post');
const apis_group = require('./routes/group');

//database and local envirnment configurations
//require('./nodemon_config')
require('./config/db_connection')


// cors middleware for orign and Headers
app.use(cors());


//bodyparser middleware
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(bodyParser.json());

// morga middleware for loging every request on console
app.use(morgan("dev"));

//file upload middleware
app.use(fileUpload());
app.use('/uploads', express.static('./uploads'));


// staic folder
app.use(express.static(path.join(__dirname, 'public/dist')));


//Routes which should handle request
app.all('/', function (req, res, next) {

      res.sendFile(path.join(__dirname, 'public/dist/index.html'));

});


app.use('/api/workspace', apis_workspace);
app.use('/api/auth', apis_auth);
app.use('/api/user', apis_user);
app.use('/api/post', apis_post);
app.use('/api/group', apis_group);

// Invalid routes handling middleware
app.use((req, res, next) => {
      const error = new Error("404 not found");
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