const express = require("express");
const bodyParser = require("body-parser")
const mongoose = require('mongoose');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
const path = require('path');
const app = express();

require('./nodemon_config')
require('./config/db_connection')

const apis = require('./Routes/api')

// adding middlewares
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({
      extended: true
}));
app.use(bodyParser.json());

//file upload middleware
app.use(fileUpload());
app.use('/uploads', express.static('/home/ubuntu/octonius/uploads'));

//Routes which should handle request
app.use('/api', apis);

// handling invalid routes
app.use((req, res, next) => {

      const error = new Error("404 not found");
      next(error);
});

// handling errors
app.use((error, req, res, next) => {

      res.status(error.status || 500);
      res.json({
            error: {
                  message: error.message
            }
      });
})

module.exports = app;