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

// GET - get subscription details
routes.get('/get-subscription/:subscriptionId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getSubscription);

// GET - get customer details
routes.get('/get-customer/:customerId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getCustomer);

// GET - get subscription prices
routes.get('/get-subscription-prices/:workspaceId', authsHelper.verifyToken, authsHelper.isLoggedIn, billing.getSubscriptionPrices);

/*  ===================
 *  -- EXPORT ROUTES --
 *  ===================
 * */
export { routes as billingRoutes }