const stripe = require('stripe')('sk_test_dvebbZQPA4Vk8kKZaEuN32sD');
const { Workspace } = require('../models');
const { sendErr } = require('../../utils');

const createSubscription = async (req, res) => {
  try {
    const email = 'tijl.declerck@outlook.com';
    const workspace_id = '5c43786f6c889c2dbc90cce2';

    // get the payment plan
    const plan = await stripe.plans.retrieve('plan_EK1uRUJLJcDS6e');

    // const existingCustomerDoc = await StripeCustomer.findOne({ email });

    // // if we couldn't find an existing customer in our database...
    // if (!existingCustomerDoc) {
    //   // then we create a new customer
    const customer = await stripe.customers.create({
      email,
      source: 'tok_mastercard'
    });
    // } else {
    // //  we retrieve this customer in stripe
    //   customer = await stripe.customers.retrieve(existingCustomerDoc.customer_id);
    // }

    // subscribe the customer to the plan
    // You now have a customer subscribed to a plan.
    // Behind the scenes, Stripe creates an invoice for every billing cycle.
    // The invoice outlines what the customer owes, reflects when they will be or were charged, and tracks the payment status.
    // You can even add additional items to an invoice to factor in one-off charges like setup fees.
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        plan: plan.id
      }]
    });

    if (!subscription) {
      return sendErr(res, null, 'Unable to create subscription', 403);
    }

    // we add the Stripe subscription Id and the last moment this subscription is valid to the workspace document
    const workspace = await Workspace.findOneAndUpdate(
      { _id: workspace_id },
      {
        $set: {
          'billing.subscription_id': subscription.id,
          'billing.current_period_end': subscription.current_period_end
        }
      }, {
        new: true
      }
    );

    // we also need to install web hooks to listen for stripe payment events

    res.status(200).json({
      message: 'payment complete',
      obj: subscription
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

module.exports = {
  createSubscription
};
