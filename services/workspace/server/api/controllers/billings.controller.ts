import { Request, Response, NextFunction } from 'express';
import { User, Workspace } from "../models";
import { sendError } from "../../utils";
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

            // Source ID of the token
            const source = req.body.token.id;

            // Source Email of the token
            const email = req.body.token.email;

            // Fetch current loggedIn User
            const user: any = await User.findOne({ _id: req['userId'] })
                .select('_workspace');

            // Count all the users present inside the workspace
            const usersCount: any = await User.find({ _id: user['_workspace'] })
                .countDocuments();

            // Current loggedIn User's ID
            const workspaceId = user._workspace;

            // Get the payment plan
            const plan = await stripe.plans.retrieve(process.env.stripe_plan);

            // Create a new customer
            const customer = await stripe.customers.create({
                email,
                source,
                metadata: {
                    workspace_id: workspaceId.toString()
                }
            });

            // Create a new subscription
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [{
                    plan: plan.id,
                    quantity: usersCount
                }]
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
                        'billing.current_period_end': subscription.current_period_end
                    }
                }, {
                new: true
            }).select('billing');

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
                .select('billing.current_period_end');

            // Check the state of the current_period_end value
            if (workspace.billing.current_period_end) {
                if (workspace.billing.current_period_end < moment().unix()) {

                    // Send the status 200 response 
                    res.status(200).json({
                        message: 'Your subscription is no longer valid',
                        status: false
                    });
                } else {

                    // Send the status 200 response 
                    res.status(200).json({
                        message: 'You have a valid subscription',
                        status: true
                    });
                }
            } else {

                // Send the status 200 response 
                res.status(200).json({
                    message: 'No payment yet',
                    status: moment().isBetween(workspace.created_date, moment(workspace.created_date).add(14, 'days'))
                });
            }
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for getting the subscription details
     * @param { userId }req 
     * @param res 
     */
    async getSubscription(req: Request, res: Response) {
        try {

            // Fetch current loggedIn User
            const user: any = await User.findOne({ _id: req['userId'] });

            // Fetch the subscriptionId from the workspace
            const workspace: any = await Workspace.findOne({ _id: user._workspace })
                .select('billing.subscription_id')

            // Retrieve the subcription details
            const subscription = await stripe.subscriptions.retrieve(workspace.billing.subscription_id);

            // If unable to fetch the subscription
            if (!subscription) {
                return sendError(res, new Error('Unable to fetch the subcription details!'), 'Unable to fetch the subcription details!', 403);
            }

            // Prepare adjustedSubscription Object
            const adjustedSubscription = {
                created: subscription.created,
                current_period_end: subscription.current_period_end,
                current_period_start: subscription.current_period_start,
                object: subscription.object,
                amount: subscription.plan.amount,
                interval: subscription.plan.interval,
                quantity: subscription.quantity
            }

            // Send the status 200 response
            return res.status(200).json({
                message: 'succesfully retrieved the subscription',
                subscription: adjustedSubscription
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
            const workspace: any = await Workspace.findOne({ _id: user._workspace }).select('billing.subscription_id')

            // Update the status of subscription
            const updatedSubscription = stripe.subscriptions.update(
                workspace.billing.subscription_id,
                { cancel_at_period_end: true }
            )

            // If unable to cancel the subscription
            if (!updatedSubscription) {
                return sendError(res, new Error('Unable to cancel the subcription!'), 'Unable to cancel the subscription!', 403);
            }

            // Update workspace scheduled cancellation property
            const updatedWorkspace = await Workspace.findOneAndUpdate(
                { _id: user._workspace },
                {
                    $set: {
                        'billing.scheduled_cancellation': true
                    }
                }, {
                new: true
            }).select('billing.scheduled_cancellation')

            // Send the status 200 response
            return res.status(200).json({
                message: 'Successfully canceled subscription',
                workspace: updatedWorkspace
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
            }).select('billing.scheduled_cancellation')

            // Send the status 200 response
            return res.status(200).json({
                message: 'Successfully resumed subscription',
                workspace: updatedWorkspace
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
            const usersCount: any = await User.find({ _workspace: user['_workspace']['_id'] })
                .countDocuments();

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
                    'billing.subscription_id': subscription.id,
                    'billing.cancelled': false
                }
            }, {
                new: true
            }).select('billing')

            // Prepare adjustedSubscription Object
            const adjustedSubscription = {
                created: subscription.created,
                current_period_end: subscription.current_period_end,
                current_period_start: subscription.current_period_start,
                object: subscription.object,
                amount: subscription.plan.amount,
                interval: subscription.plan.interval,
                quantity: usersCount
            }

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
     * This function handles the failed payments
     * @param { body.data.object.customer, body.data.object.subscription }req 
     * @param res 
     */
    async paymentFailed(req: Request, res: Response) {
        try {

            // Retrieve the customer linked to this payment
            const customer = await stripe.customers.retrieve(req.body.data.object.customer);

            // We need to cancel the current subscription
            await stripe.subscriptions.del(req.body.data.object.subscription);

            // Update the workspace to notify the user of the failed payment
            await Workspace.findOneAndUpdate(
                { _id: customer.metadata.workspace_id },
                {
                    $addToSet: {
                        'billing.failed_payments': req.body
                    },
                    $set: {
                        'billing.cancelled': true
                    }
                }, {
                new: true
            }
            ).lean();

            // send mail to user (still to be added)

            // Send the status 200 response
            return res.status(200).json({
                message: 'Payment has been failed!'
            });
        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }

    /**
     * This function handles the payments which are succesful
     * @param req 
     * @param res 
     */
    async paymentSuccessful(req: Request, res: Response) {
        try {

            // Get the Stripe customer linked to this payment
            const customer = await stripe.customers.retrieve(req.body.data.object.customer);

            // get the subscription of the customer
            // review this, there is probably a subscription mentioned in req.body
            const subscription = await stripe.subscriptions.retrieve(req.body.data.object.subscription);

            // add it to the billing.success_payments property of the workspace
            // I am not sure if billing.current_period_end is already updated at this point
            await Workspace.findOneAndUpdate(
                { _id: customer.metadata.workspace_id },
                {
                    $addToSet: {
                        'billing.success_payments': req.body
                    },
                    $set: {
                        'billing.current_period_end': subscription.current_period_end,
                        'billing.failed_payments': []
                    }
                }, {
                new: true
            }
            ).lean();

            // send mail to user (still to be added)

            // Send the status 200 response
            return res.status(200).json({
                message: 'Payment is successful!'
            });
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

            // SubscriptionId of the subscription
            const { subscriptionId } = req.query;

            // Adding user to the subscription
            await addUserToSubscription(stripe, subscriptionId)
                .then(() => {

                    // Send the status 200 response
                    return res.status(200).json({
                        message: 'User is added to the subscription!'
                    });
                })
                .catch(() => {
                    return sendError(res, new Error('Unable to add user to the subscription!'), 'Unable to add user to the subscription!', 403);
                })

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

            // SubscriptionId of the subscription
            const { subscriptionId } = req.query;

            // Adding user to the subscription
            await removeUserFromSubscription(stripe, subscriptionId)
                .then(() => {

                    // Send the status 200 response
                    return res.status(200).json({
                        message: 'User is removed from the subscription!'
                    });
                })
                .catch(() => {
                    return sendError(res, new Error('Unable to remove the user from the subscription!'), 'Unable to remove user the from the subscription!', 403);
                })

        } catch (err) {
            return sendError(res, err, 'Internal Server Error!', 500);
        }
    }
}

