const { Workspace } = require('../../api/models');

const stripe = require('stripe')('sk_test_dvebbZQPA4Vk8kKZaEuN32sD');

const addUserToSubscription = async (workspace) => {

  // we need the subscription id that we saved earlier in the db
  const subscriptionId = workspace.billing.subscription_id;

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  const updatedSubscription = await stripe.subscriptions.update(
    workspace.billing.subscription_id,
    { quantity: subscription.quantity + 1 }
  );

};

module.exports = {
  addUserToSubscription
};
