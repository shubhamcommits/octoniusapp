import { Request, Response, NextFunction } from 'express';
import { Group, User, Workspace } from "../models";
import { sendError } from "../../utils";
import http from 'axios';
import moment from 'moment';
import { addUserToSubscription, removeUserFromSubscription } from '../../utils/billing';

// Create Stripe Object
const stripe = require('stripe')(process.env.SK_STRIPE);

export class BillingControllers {

    /**
     * This function is responsible for creating the subscription for the current workspace
     * @param { body.token.id, body.token.email, userId }req 
     * @param res 
     * @param next 
     */
    async createSubscription(req: Request, res: Response, next: NextFunction) {
        try {
            // Fetch current loggedIn User
            const user: any = await User.findOne({ _id: req['userId'] })
                .select('_workspace');

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: user['_workspace'] }
            ] }).countDocuments();

            // Current loggedIn User's ID
            const workspaceId = user._workspace;

            let customerId = req.body.customerId;
            if (!customerId || customerId === '' ) {
                // Source ID of the token
                const source = req.body.token.id;

                // Source Email of the token
                const email = req.body.token.email;

                // Create a new customer
                const customer = await stripe.customers.create({
                    email,
                    source,
                    metadata: {
                        workspace_id: workspaceId.toString()
                    }
                });
                
                customerId = customer.id;
            } else {
                // check if the customer exists in the DB, maybe it was deleted in the console
                let customer = await stripe.customers.retrieve(req.body.data.object.customer);

                if (!customer) {
                    // Source ID of the token
                    const source = req.body.token.id;

                    // Source Email of the token
                    const email = req.body.token.email;

                    customer = await stripe.customers.create({
                        email,
                        source,
                        metadata: {
                            workspace_id: workspaceId.toString()
                        }
                    });
                }
                
                customerId = customer.id;
            }
            

            // Create a new subscription
            const subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [{
                    price: req.body.priceId,
                    quantity: usersCount
                }],
            });

            // If subscription is not created
            if (!subscription) {
                return sendError(res, new Error('Unable to create the subscription!'), 'Unable to create the subscription!', 403);
            }

            // Add the Stripe subscription Id and the last moment this subscription is valid to the workspace document
            const workspaceUpdated = await Workspace.findOneAndUpdate(
                { _id: workspaceId },
                {
                    $set: {
                        'billing.subscription_id': subscription.id,
                        'billing.subscription_item_id': subscription.items.data[0].id,
                        'billing.current_period_end': subscription.current_period_end,
                        'billing.quantity': subscription.quantity,
                        'billing.client_id': customerId,
                        'billing.product_id': req.body.product_id,
                        'billing.price_id':  req.body.priceId
                    }
                }, {
            });
            //}).select('billing');

            // Prepare adjustedSubscription Object
            const adjustedSubscription = {
                created: subscription.created,
                current_period_end: subscription.current_period_end,
                current_period_start: subscription.current_period_start,
                object: subscription.object,
                amount: subscription.plan.amount,
                interval: subscription.plan.interval,
                quantity: subscription.quantity
            };

            // We also need to install web hooks to listen for stripe payment events


            // Send new workspace to the mgmt portal
            if (process.env.NODE_ENV == 'production') {
                // Count all the groups present inside the workspace
                const groupsCount: number = await Group.find({ $and: [
                    { group_name: { $ne: 'personal' } },
                    { _workspace: workspaceId }
                ]}).countDocuments();

                // Count all the users present inside the workspace
                const guestsCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspaceId },
                    { role: 'guest'}
                ] }).countDocuments();

                let workspaceMgmt = {
                    _id: workspaceId,
                    company_name: workspaceUpdated.company_name,
                    workspace_name: workspaceUpdated.workspace_name,
                    owner_email: workspaceUpdated.owner_email,
                    owner_first_name: workspaceUpdated.owner_first_name,
                    owner_last_name: workspaceUpdated.owner_last_name,
                    _owner_remote_id: workspaceUpdated._owner,
                    environment: process.env.DOMAIN,
                    num_members: usersCount,
                    num_invited_users: guestsCount,
                    num_groups: groupsCount,
                    created_date: workspaceUpdated.created_date,
                    billing: {
                        subscription_id: subscription.id || '',
                        current_period_end: subscription.current_period_end || '',
                        scheduled_cancellation: false,
                        quantity: subscription.quantity || 0
                    }
                }
                http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspaceId}/update`, {
                    API_KEY: process.env.MANAGEMENT_API_KEY,
                    workspaceData: workspaceMgmt
                });
            }

            // Send the status 200 response
            res.status(200).json({
                message: 'payment complete',
                subscription: adjustedSubscription,
                workspace: workspaceUpdated
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function checks whether the subscription is valid or not
     * @param { params.userId }req 
     * @param res 
     */
    async checkSubscriptionValidity(req: Request, res: Response) {
        try {

            const userId = req['userId'];

            // Find user to extract his workspace
            const user: any = await User.findOne({ _id: userId })
                .select('_id')
                .populate({
                    path: '_workspace',
                    select: 'billing.current_period_end'
                })

            // If the current_period_end doesn't exist
            if (!user._workspace.billing.current_period_end) {
                return res.status(200).json({
                    message: 'No subscription yet!',
                    valid: moment().isBetween(user._workspace.created_date, moment(user._workspace.created_date).add(14, 'days'))
                });
            }

            // Send the status 200 response 
            return res.status(200).json({
                message: 'Successfully checked validity of subscription!',
                valid: user._workspace.billing.current_period_end > moment().unix()
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for fetching the billing status
     * @param { params.workspaceId }req 
     * @param res 
     */
    async getBillingStatus(req: Request, res: Response) {
        try {

            const { workspaceId } = req.params;

            // Fetch the current_period_end value
            const workspace: any = await Workspace.findOne({ _id: workspaceId })
                .select('billing created_date');

            let message = '';
            let status = true;

            if (!workspace) {
                message = 'Workspace does not exist',
                status = false
            } else {
                // Check the state of the current_period_end value
                if (workspace.billing.current_period_end) {
                    if (workspace.billing.current_period_end < moment().unix()) {
                        message = 'Your subscription is no longer valid';
                        status = false;
                    } else {
                        message = 'You have a valid subscription';
                        status = true;
                    }
                } else {
                    message = 'No payment yet';
                    status = moment(workspace.created_date).add(15, 'days').diff(moment(), 'days') >= 0;
                }

                // Check to stripe if the payment was done in stripe
                if (!status && workspace.billing.subscription_id) {

                    const subscription = await stripe.subscriptions.retrieve(
                        workspace.billing.subscription_id
                    );

                    if (subscription.current_period_end < moment().unix()) {
                        message = 'Your subscription is no longer valid';
                        status = false;
                    } else {
                        message = 'You have a valid subscription';
                        status = true;
                    }

                    // update the workspace data in the database
                    await Workspace.findOneAndUpdate({
                        _id: workspaceId
                    }, {
                        $set: {
                            'billing.current_period_end': subscription.current_period_end,
                            'billing.subscription_id': subscription.id
                        }
                    }, {
                        new: true
                    }).select('billing')
                }
            }

            // Send the status 200 response 
            res.status(200).json({
                message: message,
                status: status
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for getting the subscription details
     * @param { customerId }req 
     * @param res 
     */
    async getSubscription(req: Request, res: Response) {
        try {
            const { subscriptionId } = req.params;

            let subscription = await stripe.subscriptions.retrieve(subscriptionId);

            // Send the status 200 response
            return res.status(200).json({
                message: 'succesfully retrieved the subscription',
                subscription: subscription
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for getting the customer details
     * @param { customerId }req 
     * @param res 
     */
    async getCustomer(req: Request, res: Response) {
        try {
            const { customerId } = req.params;

            const customer = await stripe.customers.retrieve(customerId);

            // Send the status 200 response
            return res.status(200).json({
                message: 'succesfully retrieved the subscription',
                customer: customer
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for getting the list of charges
     * @param { customerId }req 
     * @param res 
     */
    async getCharges(req: Request, res: Response) {

        try {
            const { customerId } = req.params;

            let charges = await stripe.paymentIntents.list({
                customer: customerId
            });

            // Send the status 200 response
            return res.status(200).json({
                message: 'succesfully retrieved the charges',
                charges: charges
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async getSubscriptionPrices(req: Request, res: Response) {
        try {
            const { productId } = req.params;

            const prices = await stripe.prices.list({
                product: productId,
                active: true
              });
            
            // Send the status 200 response
            return res.status(200).json({
                message: 'succesfully retrieved the subscription',
                prices: prices
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for cacelling the subscription
     * @param { userId }req 
     * @param res 
     */
    async cancelSubscription(req: Request, res: Response) {
        try {

            // Find the current loggedIn user
            const user: any = await User.findOne({ _id: req['userId'] })

            // Fetch the subscriptionId from the workspace
            const workspace: any = await Workspace.findOne({ _id: user._workspace });

            const updatedSubscription = stripe.subscriptions.update(
                workspace.billing.subscription_id,
                { cancel_at_period_end: true }
            )

            // If unable to cancel the subscription
            if (!updatedSubscription) {
                return sendError(res, new Error('Unable to cancel the subcription!'), 'Unable to cancel the subscription!', 403);
            }

            /*
            // Cancel subscription
            const deleted = await stripe.subscriptions.del(
                workspace.billing.subscription_id
            );

            // If unable to cancel the subscription
            if (!deleted) {
                return sendError(res, new Error('Unable to cancel the subcription!'), 'Unable to cancel the subscription!', 403);
            }
            */

            // Update workspace scheduled cancellation property
            const updatedWorkspace = await Workspace.findOneAndUpdate(
                { _id: user._workspace },
                {
                    $set: {
                        'billing.scheduled_cancellation': true
                    }
                }, {
                new: true
            }).select('billing.scheduled_cancellation');

            // Send new workspace to the mgmt portal
            if (process.env.NODE_ENV == 'production') {
                // Count all the groups present inside the workspace
                const groupsCount: number = await Group.find({ $and: [
                    { group_name: { $ne: 'personal' } },
                    { _workspace: workspace._id }
                ]}).countDocuments();

                // Count all the users present inside the workspace
                const usersCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspace._id }
                ] }).countDocuments();

                // Count all the users present inside the workspace
                const guestsCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspace._id },
                    { role: 'guest'}
                ] }).countDocuments();

                let workspaceMgmt = {
                    _id: workspace._id,
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
                    billing: {
                        subscription_id: updatedSubscription.id || '',
                        current_period_end: updatedSubscription.current_period_end || '',
                        scheduled_cancellation: true,
                        quantity: updatedSubscription.quantity || 0
                    }
                }
                http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                    API_KEY: process.env.MANAGEMENT_API_KEY,
                    workspaceData: workspaceMgmt
                });
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Successfully canceled subscription',
                workspace: updatedWorkspace,
                subscription: updatedSubscription
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for resuming the subscription
     * @param { userId }req 
     * @param res 
     */
    async resumeSubscription(req: Request, res: Response) {
        try {

            // Find the current loggedIn user
            const user: any = await User.findOne({ _id: req['userId'] })

            // Fetch the subscriptionId from the workspace
            const workspace: any = await Workspace.findOne({ _id: user._workspace }).select('billing.subscription_id')

            // Update the status of subscription
            const updatedSubscription = stripe.subscriptions.update(
                workspace.billing.subscription_id,
                { cancel_at_period_end: false }
            )

            // If unable to resume the subscription
            if (!updatedSubscription) {
                return sendError(res, new Error('Unable to resume the subscription!'), 'Unable to resume the subscription!', 403);
            }

            // Update workspace scheduled cancellation property
            const updatedWorkspace = await Workspace.findOneAndUpdate(
                { _id: user._workspace },
                {
                    $set: {
                        'billing.scheduled_cancellation': false
                    }
                }, {
                new: true
            }).select('billing.scheduled_cancellation');

            // Send new workspace to the mgmt portal
            if (process.env.NODE_ENV == 'production') {
                // Count all the groups present inside the workspace
                const groupsCount: number = await Group.find({ $and: [
                    { group_name: { $ne: 'personal' } },
                    { _workspace: workspace._id }
                ]}).countDocuments();

                // Count all the users present inside the workspace
                const usersCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspace._id }
                ] }).countDocuments();

                // Count all the users present inside the workspace
                const guestsCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspace._id },
                    { role: 'guest'}
                ] }).countDocuments();

                let workspaceMgmt = {
                    _id: workspace._id,
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
                    billing: {
                        subscription_id: updatedSubscription.id || '',
                        current_period_end: updatedSubscription.current_period_end || '',
                        scheduled_cancellation: false,
                        quantity: updatedSubscription.quantity || 0
                    }
                }
                http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                    API_KEY: process.env.MANAGEMENT_API_KEY,
                    workspaceData: workspaceMgmt
                });
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'Successfully resumed subscription',
                workspace: updatedWorkspace,
                subscription: updatedSubscription
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for renewing the subscription
     * @param { userId }req 
     * @param res 
     */
    async renewSubscription(req: Request, res: Response) {
        try {

            // Find the current User and populate their workspace property
            const user: any = await User.findOne({ _id: req['userId'] })
                .select('_id')
                .populate({
                    path: '_workspace',
                    select: 'billing.current_period_end, billing.subscription_id'
                })

            // Count all the users present in the workspace
            const usersCount: number = await User.find({ $and: [
                  { active: true },
                  { _workspace: user['workspace']['_id'] }
              ] }).countDocuments();

            // Retrieve the old subscription
            const oldSubscription = await stripe.subscriptions.retrieve(user._workspace.billing.subscription_id)

            // Use the same plan
            const plan = oldSubscription.plan.id;

            // Use the same customer
            const customer = oldSubscription.customer;

            // Create new subscription
            const subscription = await stripe.subscriptions.create({
                customer,
                items: [{
                    plan,
                    quantity: usersCount
                }]
            })

            // If unable to create the workspace
            if (!subscription) {
                return sendError(res, new Error('Unable to create the subscription!'), 'Unable to create the subscription!', 403);
            }

            // update the workspace data in the database
            const updatedWorkspace = await Workspace.findOneAndUpdate({
                _id: user._workspace
            }, {
                $set: {
                    'billing.current_period_end': subscription.current_period_end,
                    'billing.failed_payments': [],
                    'billing.quantity': usersCount,
                    'billing.subscription_id': subscription.id
                }
            }, {
                new: true
            });
            //}).select('billing');

            // Send new workspace to the mgmt portal
            if (process.env.NODE_ENV == 'production') {
                // Count all the groups present inside the workspace
                const groupsCount: number = await Group.find({ $and: [
                    { group_name: { $ne: 'personal' } },
                    { _workspace: updatedWorkspace._id }
                ]}).countDocuments();

                // Count all the users present inside the workspace
                const guestsCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: updatedWorkspace._id },
                    { role: 'guest'}
                ] }).countDocuments();

                let workspaceMgmt = {
                    _id: updatedWorkspace._id,
                    company_name: updatedWorkspace.company_name,
                    workspace_name: updatedWorkspace.workspace_name,
                    owner_email: updatedWorkspace.owner_email,
                    owner_first_name: updatedWorkspace.owner_first_name,
                    owner_last_name: updatedWorkspace.owner_last_name,
                    _owner_remote_id: updatedWorkspace._owner,
                    environment: process.env.DOMAIN,
                    num_members: usersCount,
                    num_invited_users: guestsCount,
                    num_groups: groupsCount,
                    created_date: updatedWorkspace.created_date,
                    billing: {
                        subscription_id: subscription.id || '',
                        current_period_end: subscription.current_period_end || '',
                        scheduled_cancellation: false,
                        quantity: subscription.quantity || 0
                    }
                }
                http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${updatedWorkspace._id}/update`, {
                    API_KEY: process.env.MANAGEMENT_API_KEY,
                    workspaceData: workspaceMgmt
                });
            }

            // Prepare adjustedSubscription Object
            const adjustedSubscription = {
                created: subscription.created,
                current_period_end: subscription.current_period_end,
                current_period_start: subscription.current_period_start,
                object: subscription.object,
                amount: subscription.plan.amount,
                interval: subscription.plan.interval,
                quantity: usersCount
            };

            // Send the status 200 response
            return res.status(200).json({
                message: 'Subscription renewed',
                subscription: adjustedSubscription,
                workspace: updatedWorkspace
            })
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for adding the user to the subscription
     * @param req 
     * @param res 
     */
    async addUserToSubscription(req: Request, res: Response) {
        try {
            // Fetch current loggedIn User
            const user: any = await User.findOne({ _id: req['userId'] }).select('_workspace');

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: user['_workspace'] }
            ] }).countDocuments();
            let priceId = req.body.priceId;
            let workspaceId = req.body.workspaceId;
            let subscriptionId = req.body.subscriptionId;

            // Adding user to the subscription
            await addUserToSubscription(stripe, subscriptionId, priceId, workspaceId, usersCount)
                .then(() => {

                    // Send the status 200 response
                    return res.status(200).json({
                        message: 'User is added to the subscription!'
                    });
                })
                .catch(() => {
                    return sendError(res, new Error('Unable to add user to the subscription!'), 'Unable to add user to the subscription!', 403);
                });
            
            // Send the status 200 response
            return res.status(200).json({
                message: 'User is added to the subscription!'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for removing the user from the subscription
     * @param req 
     * @param res 
     */
    async removeUserFromSubscription(req: Request, res: Response) {
        try {
            // Fetch current loggedIn User
            const user: any = await User.findOne({ _id: req['userId'] }).select('_workspace');

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: user['_workspace'] }
            ] }).countDocuments();

            // SubscriptionId of the subscription            
            let priceId = req.body.priceId;
            let workspaceId = req.body.workspaceId;
            let subscriptionId = req.body.subscriptionId;

            // Adding user to the subscription
            await removeUserFromSubscription(stripe, subscriptionId, priceId, workspaceId, usersCount)
                .then(() => {

                    // Send the status 200 response
                    return res.status(200).json({
                        message: 'User is removed from the subscription!'
                    });
                })
                .catch(() => {
                    return sendError(res, new Error('Unable to remove the user from the subscription!'), 'Unable to remove user the from the subscription!', 403);
                });

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    async subscriptionUpdates(req: Request, res: Response) {
        
        // Let the stripe event
        let event: any = {};

        try {
            event = req.body;
        } catch (err) {
            return sendError(res, err, `Webhook Error: ${err.message}`, 400);
        }

        try {
            const stripeObject = event.data.object;
            const customer = await stripe.customers.retrieve(stripeObject.customer);
            let workspace;
            // Handle the event
            switch (event.type) {
                case 'customer.subscription.updated':
                    workspace = await Workspace.findOneAndUpdate(
                        { _id: customer.metadata.workspace_id },
                        {
                            $set: {
                                'billing.price_id': stripeObject.items.data[0].price.id,
                            }
                        }, {
                            new: true
                        }
                    ).lean();
                    break;

                case 'customer.subscription.deleted':
                    workspace = await Workspace.findOneAndUpdate(
                        { _id: customer.metadata.workspace_id },
                        {
                            $set: {
                                'billing.current_period_end': stripeObject.current_period_end,
                                'billing.scheduled_cancellation': stripeObject.cancel_at_period_end
                            }
                        }, {
                            new: true
                        }
                    ).lean();
                    break;

                case 'invoice.payment_succeeded':
                case 'checkout.session.completed':
                case 'invoice.paid':
                    workspace = await Workspace.findOneAndUpdate(
                        { _id: customer.metadata.workspace_id },
                        {
                            $addToSet: {
                                'billing.success_payments': req.body
                            },
                            $set: {
                                'billing.current_period_end': stripeObject.period_end,
                                'billing.scheduled_cancellation': false
                            }
                        }, {
                            new: true
                        }
                    ).lean();
                    break;

                case 'invoice.payment_failed':
                    workspace = await Workspace.findOneAndUpdate(
                        { _id: customer.metadata.workspace_id },
                        {
                            $addToSet: {
                                'billing.failed_payments': req.body
                            },
                            $set: {
                                'billing.scheduled_cancellation': true,
                                'billing.current_period_end': stripeObject.period_end,
                            }
                        }, {
                            new: true
                        }
                    ).lean();
                    break;
                default:
                    console.log(`Unhandled event type ${event.type}`);
            }

            // Send new workspace to the mgmt portal
            if (process.env.NODE_ENV == 'production') {
                // Count all the groups present inside the workspace
                const groupsCount: number = await Group.find({ $and: [
                    { group_name: { $ne: 'personal' } },
                    { _workspace: workspace._id }
                ]}).countDocuments();

                // Count all the users present inside the workspace
                const usersCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspace._id }
                ] }).countDocuments();

                // Count all the users present inside the workspace
                const guestsCount: number = await User.find({ $and: [
                    { active: true },
                    { _workspace: workspace._id },
                    { role: 'guest'}
                ] }).countDocuments();

                let workspaceMgmt = {
                    _id: workspace._id,
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
                    billing: {
                        subscription_id: (workspace.billing) ? workspace.billing.subscription_id : '',
                        current_period_end: (workspace.billing) ? workspace.billing.current_period_end : '',
                        scheduled_cancellation: (workspace.billing) ? workspace.billing.scheduled_cancellation : false,
                        quantity: usersCount || 0
                    }
                }
                http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                    API_KEY: process.env.MANAGEMENT_API_KEY,
                    workspaceData: workspaceMgmt
                });
            }

            // Return a response to acknowledge receipt of the event
            return res.json({received: true});
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function creates a customer client portal session
     * @param { body.data.object.customer, body.data.object.subscription }req 
     * @param res 
     */
    async createClientPortalSession(req: Request, res: Response) {
        try {
            let customerId = req.body.customer;
            let return_url = req.body.return_url;

            if (!customerId || !return_url) {
                return sendError(res, new Error('You need to provide a stripe customerId and a return url!'), 'You need to provide a stripe customerId and a return url!', 403);
            }

            const customer = await stripe.customers.retrieve(customerId);
            
            if (!customer) {
                return sendError(res, new Error('The customer you provided does not exists!'), 'The customer you provided does not exists!', 403);
            }

            var session = await stripe.billingPortal.sessions.create({
                customer: customerId,
                return_url: return_url,
            });

            // Send the status 200 response
            return res.status(200).json({
                message: 'Session created!',
                session: session
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function creates a customer check-out portal session
     * @param { body.data.price, body.data.return_url }req 
     * @param res 
     */
    async createCheckoutSession(req: Request, res: Response) {
        try {
            let { priceId, return_url, workspaceId } = req.body;

            if (!priceId || !return_url || !workspaceId) {
                return sendError(res, new Error('You need to provide a stripe priceId, workspaceId and a return url!'), 'You need to provide a stripe priceId, workspaceId and a return url!', 403);
            }

            const workspace = await Workspace.find({_id: workspaceId}).select('owner_email').lean();

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();

            const session = await stripe.checkout.sessions.create({
                mode: "subscription",
                payment_method_types: ["card"],
                line_items: [
                  {
                    price: priceId,
                    // For metered billing, do not pass quantity
                    quantity: usersCount,
                  },
                ],
                // {CHECKOUT_SESSION_ID} is a string literal; do not change it!
                // the actual Session ID is returned in the query parameter when your customer
                // is redirected to the success page.
                success_url: `${return_url}?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: return_url,
                customer_email: workspace.owner_email,
                metadata: {
                    workspace_id: workspaceId.toString()
                },
                allow_promotion_codes: true
            });

            // Send the status 200 response
            return res.status(200).json({
                message: 'Session created!',
                session: session
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * 
     * @param req Method to featch the checkout session
     * @param res 
     */
    async getCheckoutSession(req: Request, res: Response) {       
        try {
            const { sessionId, workspaceId } = req.params;

            if (!sessionId) {
                return sendError(res, new Error('You need to provide a stripe sessionId!'), 'You need to provide a sessionId!', 403);
            }

            const session = await stripe.checkout.sessions.retrieve(sessionId);

            let subscription = await stripe.subscriptions.retrieve(
                session.subscription
            );

            // Count all the users present inside the workspace
            const usersCount: number = await User.find({ $and: [
                { active: true },
                { _workspace: workspaceId }
            ] }).countDocuments();

            const workspace = await Workspace.findOneAndUpdate(
                { _id: workspaceId },
                {
                    $set: {
                        'billing.subscription_id': subscription.id,
                        'billing.subscription_item_id': subscription.items.data[0].id,
                        'billing.current_period_end': subscription.current_period_end,
                        'billing.quantity': usersCount,
                        'billing.client_id': session.customer,
                        'billing.product_id': subscription.items.data[0].price.product,
                        'billing.price_id':  subscription.items.data[0].price.id
                    }
                })
                .populate({
                    path: 'members',
                    select: 'first_name last_name profile_pic role email active'
                }).lean();

                // Add time remaining property to maintain the trial version of the user
                workspace.time_remaining = moment(workspace.created_date).add(15, 'days').diff(moment(), 'days');

            // Send the status 200 response
            return res.status(200).json({
                message: 'Session found!',
                session: session,
                subscription: subscription,
                workspace: workspace
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}
