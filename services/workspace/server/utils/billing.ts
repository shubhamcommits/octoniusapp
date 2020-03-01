/**
 * This helper function adds the user to current subscription plan
 * @param stripe 
 * @param subscriptionId
 */
const addUserToSubscription = async (stripe: any, subscriptionId: any) => {

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription details
    await stripe.subscriptions.update(
        subscriptionId,
        { quantity: subscription.quantity + 1 }
    );
}

/**
 * This helper function removes the user from the current subscription plan
 * @param stripe 
 * @param subscriptionId
 */
const removeUserFromSubscription = async (stripe: any, subscriptionId: any) => {

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription details
    await stripe.subscriptions.update(
        subscriptionId,
        { quantity: subscription.quantity - 1 }
    );
}

export {
    addUserToSubscription,
    removeUserFromSubscription
}