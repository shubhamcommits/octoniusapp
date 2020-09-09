import { Workspace, User } from "../api/models";

/**
 * This helper function adds the user to current subscription plan
 * @param stripe 
 * @param subscriptionId
 */
const addUserToSubscription = async (stripe: any, subscriptionId: any, priceId: any, workspaceId: any, usersCount: any) => {
                    
    // Update the subscription details
    let subscription = await stripe.subscriptions.update(subscriptionId, {
        price: priceId,
        quantity: usersCount
    });

    // Update the workspace details
    await Workspace.findOneAndUpdate({
        _id: workspaceId
    }, {
        'billing.quantity': usersCount
    });
}

/**
 * This helper function removes the user from the current subscription plan
 * @param stripe 
 * @param subscriptionId
 */
const removeUserFromSubscription = async (stripe: any, subscriptionId: any, priceId: any, workspaceId: any, usersCount: any) => {

    // Update the subscription details
    let subscription = await stripe.subscriptions.update(subscriptionId, {
        price: priceId,
        quantity: usersCount
    });

    // Update the workspace details
    await Workspace.findOneAndUpdate({
        _id: workspaceId
    }, {
        'billing.quantity': usersCount
    });
}

export {
    addUserToSubscription,
    removeUserFromSubscription
}