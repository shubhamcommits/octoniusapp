const mongoose = require('mongoose');

const { Schema } = mongoose;

const NotificationSchema = new Schema({
  _owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true
  },
  // Link user that created post or assigned task/event, or mentioned in a comment
  // Link post or comment where the user was related
  // Other cases???
  read: {
    type: Boolean,
    default: false
  }
});

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
