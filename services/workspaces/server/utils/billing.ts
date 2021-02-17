import { Workspace, User, Group } from "../api/models";
import http from 'axios';

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
    const workspace = await Workspace.findOneAndUpdate({
        _id: workspaceId
    }, {
        'billing.quantity': usersCount
    });

    // Send new workspace to the mgmt portal
    // Count all the groups present inside the workspace
    const groupsCount: number = await Group.find({ $and: [
        { group_name: { $ne: 'personal' } },
        { _workspace: workspaceId }
    ]}).countDocuments();

    let workspaceMgmt = {
        _id: workspaceId,
        company_name: workspace.company_name,
        workspace_name: workspace.workspace_name,
        owner_email: workspace.owner_email,
        owner_first_name: workspace.owner_first_name,
        owner_last_name: workspace.owner_last_name,
        _owner_remote_id: workspace._owner,
        environment: "PROD", // TODO
        num_members: usersCount,
        num_invited_users: workspace.invited_users.length,
        num_groups: groupsCount,
        created_date: workspace.created_date,
        billing: {
            subscription_id: subscription.id,
            current_period_end: subscription.current_period_end,
            scheduled_cancellation: false,
            quantity: subscription.quantity
        }
    }
    http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
        API_KEY: process.env.MANAGEMENT_API_KEY,
        workspaceData: workspaceMgmt
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
    const workspace = await Workspace.findOneAndUpdate({
        _id: workspaceId
    }, {
        'billing.quantity': usersCount
    });

    // Send workspace to the mgmt portal
    // Count all the groups present inside the workspace
    const groupsCount: number = await Group.find({ $and: [
        { group_name: { $ne: 'personal' } },
        { _workspace: workspaceId }
    ]}).countDocuments();

    let workspaceMgmt = {
        _id: workspaceId,
        company_name: workspace.company_name,
        workspace_name: workspace.workspace_name,
        owner_email: workspace.owner_email,
        owner_first_name: workspace.owner_first_name,
        owner_last_name: workspace.owner_last_name,
        _owner_remote_id: workspace._owner,
        environment: "PROD", // TODO
        num_members: usersCount,
        num_invited_users: workspace.invited_users.length,
        num_groups: groupsCount,
        created_date: workspace.created_date,
        billing: {
            subscription_id: subscription.id,
            current_period_end: subscription.current_period_end,
            scheduled_cancellation: false,
            quantity: subscription.quantity
        }
    }
    http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
        API_KEY: process.env.MANAGEMENT_API_KEY,
        workspaceData: workspaceMgmt
    });
}

export {
    addUserToSubscription,
    removeUserFromSubscription
}