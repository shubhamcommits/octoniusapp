import { Workspace } from "../api/models";

/**
 * This helper function adds the user to current subscription plan
 * @param stripe 
 * @param subscriptionId
 */
const addUserToSubscription = async (stripe: any, subscriptionId: any, workspaceId: any) => {

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription details
    await stripe.subscriptions.update(
        subscriptionId,
        { quantity: subscription.quantity + 1 }
    );

    // Update the workspace details
    await Workspace.findOneAndUpdate({
        _id: workspaceId
    }, {
        $inc: {
            'billing.quantity': 1
        }
    });
}

/**
 * This helper function removes the user from the current subscription plan
 * @param stripe 
 * @param subscriptionId
 */
const removeUserFromSubscription = async (stripe: any, subscriptionId: any, workspaceId) => {

    // Get the subscription details
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update the subscription details
    await stripe.subscriptions.update(
        subscriptionId,
        { quantity: subscription.quantity - 1 }
    );

    // Update the workspace details
    await Workspace.findOneAndUpdate({
        _id: workspaceId
    }, {
        $inc: {
            'billing.quantity': -1
        }
    });
}

export {
    addUserToSubscription,
    removeUserFromSubscription
}