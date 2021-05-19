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
                                'billing.current_period_end': (stripeObject.cancel_at_period_end == true) 
                                    ? moment(stripeObject.current_period_end)
                                    : moment(stripeObject.canceled_at),
                                'billing.scheduled_cancellation': moment(stripeObject.cancel_at_period_end)
                            }
                        }, {
                            new: true
                        }
                    ).lean();
                    break;

                case 'invoice.payment_succeeded':
                    workspace = await Workspace.findOneAndUpdate(
                        { _id: customer.metadata.workspace_id },
                        {
                            $addToSet: {
                                'billing.success_payments': req.body
                            },
                            $set: {
                                'billing.current_period_end': moment(stripeObject.period_end),
                                'billing.scheduled_cancellation': false
                            }
                        }, {
                            new: true
                        }
                    ).lean();
                    break;

                case 'checkout.session.completed':
                    workspace = await Workspace.findOneAndUpdate(
                        { _id: customer.metadata.workspace_id },
                        {
                            $addToSet: {
                                'billing.success_payments': req.body
                            },
                            $set: {
                                'billing.current_period_end': moment(stripeObject.period_end),
                                'billing.scheduled_cancellation': false
                            }
                        }, {
                            new: true
                        }
                    ).lean();
                    break;

                case 'invoice.paid':
                    workspace = await Workspace.findOneAndUpdate(
                        { _id: customer.metadata.workspace_id },
                        {
                            $addToSet: {
                                'billing.success_payments': req.body
                            },
                            $set: {
                                'billing.current_period_end': moment(stripeObject.period_end),
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
                                'billing.current_period_end': moment(stripeObject.period_end),
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
            if (customer.metadata.workspace_id) {

                workspace = await Workspace.findOne(
                    { _id: customer.metadata.workspace_id }
                ).lean();

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
                    access_code: workspace.access_code,
                    management_private_api_key: workspace.management_private_api_key,
                    billing: {
                        client_id: (workspace.billing) ? workspace.billing.client_id : '',
                        subscription_id: (workspace.billing) ? workspace.billing.subscription_id : '',
                        current_period_end: (workspace.billing) ? workspace.billing.current_period_end : moment().format(),
                        scheduled_cancellation: (workspace.billing) ? workspace.billing.scheduled_cancellation : false,
                        quantity: usersCount || 0
                    }
                }
                http.put(`${process.env.MANAGEMENT_URL}/api/workspace/${workspace._id}/update`, {
                    API_KEY: workspace.management_private_api_key,
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
                        'billing.current_period_end': moment(subscription.current_period_end),
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
