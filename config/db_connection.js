const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");



const dbURL = process.env.dbURL || "mongodb://127.0.0.1:27017/octonius";
mongoose.connect(dbURL);

mongoose.connection.on("connected", function () {
  console.log("Mongoose default connection is open to ", dbURL);
});
mongoose.connection.on("error", function (error) {
  console.log("Mongoose default connection has occured " + error + " error");
});
mongoose.connection.on("disconnected", function () {
  console.log("Mongoose default connection is disconnected");
});

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log("Mongoose default connection is disconnected due to application termination");
    process.exit(0);
  });
});