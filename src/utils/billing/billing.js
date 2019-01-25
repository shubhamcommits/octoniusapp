
const { Workspace } = require('../../api/models');



const addUserToSubscription = async (workspace) => {
    const stripe = require('stripe')(process.env.SK_STRIPE);
  // we need the subscription id that we saved earlier in the db
  const subscriptionId = workspace.billing.subscription_id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripe.subscriptions.update(
    workspace.billing.subscription_id,
    { quantity: subscription.quantity + 1 }
  );
};

const subtractUserFromSubscription = async (workspace) => {
    const stripe = require('stripe')(process.env.SK_STRIPE);
  const subscriptionId = workspace.billing.subscription_id;

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    await stripe.subscriptions.update(
        workspace.billing.subscription_id,
        { quantity: subscription.quantity - 1 }
    );
};

module.exports = {
  addUserToSubscription,
    subtractUserFromSubscription
};
