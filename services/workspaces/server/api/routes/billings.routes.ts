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
routes.get('/get-subscription/:subscriptionId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getSubscription);

// GET - get customer details
routes.get('/get-customer/:customerId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getCustomer);

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
routes.put('/add-user', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.addUserToSubscription);

// PUT - Removes the user from the subscription (quantity = quatity--)
routes.put('/remove-user', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.removeUserFromSubscription);

// POST - Create a customer client portal session
routes.post('/create-client-portal-session', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.createClientPortalSession);

// POST - Create a checkout portal session
routes.post('/create-checkout-session', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.createCheckoutSession);

// GET - get chargegs
routes.get('/get-checkout-session/:workspaceId/:sessionId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getCheckoutSession);

// POST - Webhook event which is receiving the updates from Stripe
routes.post('/webhooks/subscription-updates', billing.subscriptionUpdates);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as billingRoutes }