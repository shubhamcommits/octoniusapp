import mongoose from 'mongoose';

// Get Mongoose to use global promise library to avoid error messages
mongoose.Promise = global.Promise;

// Set up mongoose connection
var DB_URL = process.env.DB_URL;

/*
const options = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
  auto_reconnect: true,
  bufferMaxEntries: 0
};
*/
const options = {
};

// Connect mongoose to db
mongoose.connect(DB_URL, options)
.catch(()=>{
  mongoose.connect(DB_URL, options);
})

// Log Mongoose connection status changes:
mongoose.connection.on('connected', () => {
  // eslint-disable-next-line no-console
  console.log(`  🗄  Mongoose connection is open on\n\t${DB_URL}`);
})

mongoose.connection.on('error', (err) => {
  // eslint-disable-next-line no-console
  console.log(`Mongoose connection had an error:\n${err}`);
});

mongoose.connection.on('disconnected', () => {
  // eslint-disable-next-line no-console
  console.log('Mongoose disconnected.');

  // If Mongoose is disconnected, we attempt to restart the containers
  mongoose.connect(DB_URL, options);
});

process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    // eslint-disable-next-line no-console
    console.log('Mongoose disconnected due to app termination processs.');
    process.exit(0);
  });
});
