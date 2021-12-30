import { Notification, Post, User } from "../models";
import { Response, Request, NextFunction } from "express";
import { sendError } from "../../utils";
import { NotificationsService } from "../service";
import { sendErr } from "../../utils/sendError";
import { validateId } from "../../utils/helperFunctions";
import { helperFunctions } from '../../utils';
import axios from 'axios';

// Creating Service class in order to build wrapper class
const notificationService = new NotificationsService()

/*  ===============================
 *  -- NOTIFICATIONS CONTROLLERS --
 *  ===============================
 */

export class ApprovalNotificationsController {

    /**
     * This function is responsible for notifying the user who needs to approve/reject an item
     * @param { userId, groupId, posted_by, io } post 
     */
    async launchApprovalFlow(req: Request, res: Response, next: NextFunction) {

        const { posted_by, io } = req.body;
        try {
            const item = JSON.parse(req.body.item);

            const userlist = item.approval_flow.map(approval => {
                return {
                    _id: approval._assigned_to._id,
                    email: approval._assigned_to.email
                }
            });

            for (let index = 0; index < userlist.length; index++) {
                const assigned = userlist[index];
                // Call Service Function for leaving the group
                await notificationService.launchApprovalFlow(item, assigned, posted_by, io);

                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    item,
                    userid: assigned,
                    posted_by,
                    type: "LAUNCHAPPROVALFLOW"
                });
            }

            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments Succeeded!`,
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for notifying the user when an item he/she was working on was rejected
     * @param { userId, groupId, posted_by, io } post 
     */
    async rejectItem(req: Request, res: Response, next: NextFunction) {

        const { rejected_by, io } = req.body;
        try {
            const item = JSON.parse(req.body.item);
            let userlist = item.approval_flow.map(approval => {
                return {
                    _id: approval._assigned_to._id,
                    email: approval._assigned_to.email
                }
            });

            userlist.push({
                _id: item._posted_by._id,
                email: item._posted_by.email
            });

            for (let index = 0; index < userlist.length; index++) {
                const assigned = userlist[index];
                // Call Service Function for leaving the group
                await notificationService.rejectItem(item, assigned, rejected_by, io);

                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    item,
                    userid: assigned,
                    rejected_by,
                    type: "ITEMREJECTED"
                });
            }

            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments Succeeded!`,
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }

    /**
     * This function is responsible for notifying the users when an item was approved by every member in the flow
     * @param { userId, groupId, posted_by, io } post 
     */
    async itemApproved(req: Request, res: Response, next: NextFunction) {

        const { io } = req.body;
        try {
            const item = JSON.parse(req.body.item);
            let userlist = item.approval_flow.map(approval => {
                return {
                    _id: approval._assigned_to._id,
                    email: approval._assigned_to.email
                }
            });

            userlist.push({
                _id: item._posted_by._id,
                email: item._posted_by.email
            });

            for (let index = 0; index < userlist.length; index++) {
                const assigned = userlist[index];
                // Call Service Function for leaving the group
                await notificationService.itemApproved(item, assigned, io);
                
                await axios.post(`${process.env.INTEGRATION_SERVER_API}/notify`, {
                    item,
                    userid: assigned,
                    type: "ITEMAPPROVED"
                });
            }
            // Send status 200 response
            return res.status(200).json({
                message: `Event Assignments Succeeded!`,
            });
        } catch (err) {
            // Error Handling
            return sendErr(res, new Error(err), 'Internal Server Error!', 500);
        }
    }
}
