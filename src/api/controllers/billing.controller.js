const moment = require('moment');
const stripe = require('stripe')('sk_test_dvebbZQPA4Vk8kKZaEuN32sD');
const { Workspace, User } = require('../models');
const { sendErr } = require('../../utils');


const createSubscription = async (req, res) => {
  try {
    const source = req.body.token.id;
    const email = req.body.email;

    // get the payment plan
    const plan = await stripe.plans.retrieve('plan_EK1uRUJLJcDS6e');

    //   // then we create a new customer
    const customer = await stripe.customers.create({
      email,
      source
    });

    // create a new subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{
        plan: plan.id
      }]
    });

    if (!subscription) {
      return sendErr(res, null, 'Unable to create subscription', 403);
    }

    // find the current User and use his workspace ID
    const user = await User.findOne({ _id: req.userId });
    const workspaceId = user._workspace;

    // we add the Stripe subscription Id and the last moment this subscription is valid to the workspace document
    const workspace = await Workspace.findOneAndUpdate(
      { _id: workspaceId },
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

const getBillingStatus = async (req, res) => {
  const workspaceId = req.params.workspaceId;

  const workspace = await Workspace.findOne({ _id: workspaceId });

  if (workspace.billing.current_period_end) {
    if (workspace.billing.current_period_end < moment().unix()) {
      res.status(200).json({
        message: 'Your subscription is no longer valid',
        status: false
      });
    } else {
      res.status(200).json({
        message: 'You have a valid subscription',
        status: true
      });
    }
  } else {
    res.status(200).json({
      message: 'No payment yet',
      status: false
    });
  }
};

module.exports = {
  createSubscription,
  getBillingStatus
};
