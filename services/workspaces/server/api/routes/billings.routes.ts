import express from 'express';
import { Auths } from '../../utils';
import { BillingControllers } from '../controllers';

// Create Billing Class
const billing = new BillingControllers()

// Auths Helper Function
const authsHelper = new Auths();

// Routes List
const routes = express.Router();

// -| Workspace Billings |-

// POST - create a subscription
routes.post('/create-subscription', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.createSubscription);

// GET - get billing status
routes.get('/get-billing-status/:workspaceId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getBillingStatus);

// GET - get subscription details
routes.get('/get-subscription/:customerId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getSubscription);

// GET - get chargegs
routes.get('/get-charges/:customerId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getCharges);

// GET - get subscription prices
routes.get('/get-subscription-prices/:workspaceId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getSubscriptionPrices);

// GET - Cancel subscription
routes.get('/cancel-subscription', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.cancelSubscription);

// GET - Renew subscription
routes.get('/renew-subscription', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.renewSubscription);

// GET - Resume subscription
routes.get('/resume-subscription', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.resumeSubscription);

// GET - Check Subscription Validity
routes.get('/subscription-validity', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.checkSubscriptionValidity);

// PUT - Adds the user to the subscription (quantity = quatity++)
routes.put('/add-user', billing.addUserToSubscription);

// PUT - Removes the user from the subscription (quantity = quatity--)
routes.put('/remove-user', billing.removeUserFromSubscription);

// POST - Webhook event which triggers the event to creates a log of successful payment and update the workspace data
routes.post('/webhooks/payment-successful', billing.paymentSuccessful);

// POST - Webhook event which triggers the event to creates a log of failed payment and update the workspace data
routes.post('/webhooks/payment-failed', billing.paymentFailed);

// POST - Webhook event which is receiving the updates from Stripe
routes.post('/webhooks/subscription-updates', billing.subscriptionUpdates);

// POST - Create a customer client portal session
routes.post('/create-client-portal-session', billing.createClientPortalSession);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as billingRoutes }