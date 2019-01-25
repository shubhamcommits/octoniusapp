const mongoose = require('mongoose');

const { Schema } = mongoose;

const StripeCustomerSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  customer_id: {
    type: String,
    required: true
  }
});

const StripeCustomer = mongoose.model('StripeCustomer', StripeCustomerSchema);

module.exports = StripeCustomer;
