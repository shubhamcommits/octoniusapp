import { Workspace, User, Group } from "../api/models";
import http from 'axios';
import moment from "moment";

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

    // Count all the users present inside the workspace
    const guestsCount: number = await User.find({ $and: [
        { active: true },
        { _workspace: workspace._id },
        { role: 'guest'}
    ] }).countDocuments();

    let workspaceMgmt = {
        _id: workspaceId,
        company_name: workspace.company_name,
        workspace_name: workspace.workspace_name,
        owner_email: workspace.owner_email,
        owner_first_name: workspace.owner_first_name,
        owner_last_name: workspace.owner_last_name,
        _owner_remote_id: workspace._owner._id || workspace._owner,
        environment: process.env.DOMAIN,
        num_members: usersCount,
        num_invited_users: guestsCount,
        num_groups: groupsCount,
        created_date: workspace.created_date,
        access_code: workspace.access_code,
        management_private_api_key: workspace.management_private_api_key,
        billing: {
            client_id: subscription.customer || '',
            subscription_id: subscription.id || '',
            current_period_end: moment(subscription.current_period_end) || moment().format(),
            scheduled_cancellation: false,
            quantity: usersCount || 0
        }
    }
    http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
        API_KEY: workspace.management_private_api_key,
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

    // Count all the users present inside the workspace
    const guestsCount: number = await User.find({ $and: [
        { active: true },
        { _workspace: workspace._id },
        { role: 'guest'}
    ] }).countDocuments();

    let workspaceMgmt = {
        _id: workspaceId,
        company_name: workspace.company_name,
        workspace_name: workspace.workspace_name,
        owner_email: workspace.owner_email,
        owner_first_name: workspace.owner_first_name,
        owner_last_name: workspace.owner_last_name,
        _owner_remote_id: workspace._owner._id || workspace._owner,
        environment: process.env.DOMAIN,
        num_members: usersCount,
        num_invited_users: guestsCount,
        num_groups: groupsCount,
        created_date: workspace.created_date,
        access_code: workspace.access_code,
        management_private_api_key: workspace.management_private_api_key,
        billing: {
            client_id: subscription.customer || '',
            subscription_id: subscription.id || '',
            current_period_end: moment(subscription.current_period_end) || moment().format(),
            scheduled_cancellation: false,
            quantity: usersCount || 0
        }
    }
    http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
        API_KEY: workspace.management_private_api_key,
        workspaceData: workspaceMgmt
    });
}

export {
    addUserToSubscription,
    removeUserFromSubscription
}