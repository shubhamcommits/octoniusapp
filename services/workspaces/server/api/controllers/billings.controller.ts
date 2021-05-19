import { Request, Response, NextFunction } from 'express';
import { Group, User, Workspace } from "../models";
import { sendError } from "../../utils";
import http from 'axios';
import moment from 'moment';

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
}
