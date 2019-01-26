
const moment = require('moment');
const { Workspace, User } = require('../models');
const { sendErr } = require('../../utils');


const createSubscription = async (req, res) => {
  try {
      const stripe = require('stripe')(process.env.SK_STRIPE);

    const source = req.body.token.id;
    const email = req.body.email;

    // find the current User and use his workspace ID
    const user = await User.findOne({ _id: req.userId });
    const workspaceId = user._workspace;

    // get the payment plan
    const plan = await stripe.plans.retrieve('plan_EK1rDLfKr9NRkU');

    //   // then we create a new customer
    const customer = await stripe.customers.create({
      email,
      source,
      metadata: {
        workspace_id: workspaceId.toString()
      }
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

    // we add the Stripe subscription Id and the last moment this subscription is valid to the workspace document
    const workspaceUpdated = await Workspace.findOneAndUpdate(
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

    const adjustedSubscription = {
      created: subscription.created,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      object: subscription.object,
      amount: subscription.plan.amount,
      interval: subscription.plan.interval,
      quantity: subscription.quantity
    };

    // we also need to install web hooks to listen for stripe payment events

    res.status(200).json({
      message: 'payment complete',
      subscription: adjustedSubscription
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const getBillingStatus = async (req, res) => {
  try {

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
  } catch (err) {
    return sendErr(res, err);
  }
};

const getSubscription = async (req, res) => {
  try {
      const stripe = require('stripe')(process.env.SK_STRIPE);
    const user = await User.findOne({ _id: req.userId });
    const workspace = await Workspace.findOne({ _id: user._workspace });

    const subscription = await stripe.subscriptions.retrieve(workspace.billing.subscription_id);

    const adjustedSubscription = {
      created: subscription.created,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      object: subscription.object,
      amount: subscription.plan.amount,
      interval: subscription.plan.interval,
      quantity: subscription.quantity
    };

    res.status(200).json({
      message: 'succesfully retrieved the subscription',
      subscription: adjustedSubscription
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const cancelSubscription = async (req, res) => {
  try {
      const stripe = require('stripe')(process.env.SK_STRIPE);
    const user = await User.findOne({ _id: req.userId });
    const workspace = await Workspace.findOne({ _id: user._workspace });

    const updatedSubscription = stripe.subscriptions.update(
      workspace.billing.subscription_id,
      { cancel_at_period_end: true }
    );

    if (!updatedSubscription) {
      return sendErr(res, null, 'Unable to cancel subscription', 403);
    }

    // update workspace scheduled cancellation property
    const updatedWorkspace = await Workspace.findOneAndUpdate(
      { _id: user._workspace },
      {
        $set: {
          'billing.scheduled_cancellation': true
        }
      }, {
        new: true
      }
    );

    res.status(200).json({
      message: 'Successfully canceled subscription',
      workspace: updatedWorkspace
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const resumeSubscription = async (req, res) => {
  try {
      const stripe = require('stripe')(process.env.SK_STRIPE);
    const user = await User.findOne({ _id: req.userId });
    const workspace = await Workspace.findOne({ _id: user._workspace });

    const updatedSubscription = stripe.subscriptions.update(
      workspace.billing.subscription_id,
      { cancel_at_period_end: false }
    );

    if (!updatedSubscription) {
      return sendErr(res, null, 'Unable to resume subscription', 403);
    }

    // update workspace scheduled cancellation property
    const updatedWorkspace = await Workspace.findOneAndUpdate(
      { _id: user._workspace },
      {
        $set: {
          'billing.scheduled_cancellation': false
        }
      }, {
        new: true
      }
    );

    res.status(200).json({
      message: 'Successfully resumed subscription',
      workspace: updatedWorkspace
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const paymentFailed = async (req, res) => {
  try {
      const stripe = require('stripe')(process.env.SK_STRIPE);
    // add it to the billing.failed_payments property of the workspace
    const customer = await stripe.customers.retrieve('cus_EOmm3i3MnpKJAx');

    const workspace = await Workspace.findOneAndUpdate(
      { _id: customer.metadata.workspace_id },
      {
        $addToSet: {
          'billing.failed_payments': req.body
        }
      }, {
        new: true
      }
    ).lean();

    // send mail to user (still to be added)

    res.status(200).json({
      message: 'Success'
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const paymentSuccessful = async (req, res) => {
  try {
      const stripe = require('stripe')(process.env.SK_STRIPE);
    // get the Stripe customer
    const customer = await stripe.customers.retrieve(req.body.data.object.customer);

    // get the subscription of the customer
    const subscription = await stripe.subscriptions.retrieve(customer.subscriptions.data[0].id);

    // add it to the billing.failed_payments property of the workspace
    //   I am not sure if billing.current_period_end is already updated at this point
    //  or if we have to update this ourselves?
    const workspace = await Workspace.findOneAndUpdate(
      { _id: customer.metadata.workspace_id },
      {
        $addToSet: {
          'billing.success_payments': req.body
        },
        $set: {
          'billing.current_period_end': subscription.current_period_end
        }
      }, {
        new: true
      }
    ).lean();

    // send mail to user (still to be added)

    res.status(200).json({
      message: 'Success'
    });
  } catch (err) {
    return sendErr(res, err);
  }
};

const invoiceCreated = async (req, res) => {
    const stripe = require('stripe')(process.env.SK_STRIPE);

  const invoiceItem = await stripe.invoices.retrieve(req.body.data.object.id);

  res.status(200).json({
    message: 'hey'
  });
};


module.exports = {
  cancelSubscription,
  createSubscription,
  invoiceCreated,
  getBillingStatus,
  getSubscription,
  resumeSubscription,
  paymentFailed,
  paymentSuccessful
};
