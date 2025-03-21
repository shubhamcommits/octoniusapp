import { Response, Request, NextFunction } from "express";
import { SlackService, TeamService } from "../service";
import { User, Auth, Post, Group, Column } from '../models'
import jwt from "jsonwebtoken";
import FormData from 'form-data';
import { Auths, sendError } from '../../utils';
import { helperFunctions } from '../../utils';
import axios from 'axios'
import { DateTime } from 'luxon';

// Creating Service class in order to build wrapper class
const slackService = new SlackService();
const teamService = new TeamService();

/*  ===============================
 *  -- Integration CONTROLLERS --
 *  ===============================
 */
// Authentication Utilities Class
const auths = new Auths();

export class IntegrationController {

    /** 
     * This function is responsible to send Notification to all connected integrations
     * @param req 
     * @param res 
     * @param next 
     */
    async notify(req: Request, res: Response, next: NextFunction) {

        try {
            // Find user by user _id
            const user = await User.findById(req.body.userid).select('integrations');

            //Slack connected or not checking
            const isSlackConnected = user['integrations'].is_slack_connected || false;

            //Slack connected or not checking
            const isTeamConnected = user['integrations'].is_teams_connected || false;

            // Parsed the notfication and extract required data and format.
            const data = await helperFunctions.parsedNotificationData(req.body);

            // If Slack connected send notifcation to slack 
            if (isSlackConnected && user['integrations'].slack) {
                // Slack incomming webhook to send notification
                // Slack instance
                var slack = require('slack-notify')(user['integrations'].slack?.incoming_webhook);

                //Send notification to slack
                await slackService.sendNotificationToSlack(slack, data);
            }


            if (isTeamConnected && user['integrations'].teams) {
                await teamService.sendNotificationToTeam(data, user['integrations'].teams?.user_id, user['integrations'].teams?.tenant_id);
            }

        } catch (error) {
            return res.status(200).json({
                message: 'System can not sent Notification!'
            });
        }

        return res.status(200).json({
            message: 'System Sent Notification successed!'
        });

    }


    /** 
     * This function is to get the access token
     * @param req 
     * @param res 
     * @param next 
     */
    async token(req: Request, res: Response, next: NextFunction) {

        //find the user by id
        const user = await User.findById(req.body.code);

        if (user) {
            // Bearer Token
            var BearerToken = "";

            // Find user authentication
            const userAuth = await Auth.findOne({ _user: user._id }).sort({ created_date: -1 });
            // Token
            const token = userAuth['token'];
            //Token validation bit
            var isvalidToken = true;

            //If token is exist varify the token from jwt
            if (token && token != null) {
                jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                    if (err || !decoded) {
                        isvalidToken = false;
                        sendError(res, err, 'Unauthorized request, it must have a valid authorization token!', 500);
                    } else {
                        // Assigning and feeding the userId into the req object
                        BearerToken = BearerToken + token;
                    }
                });
            } else {
                isvalidToken = false;
            }

            // If token is not valid (i.e expired, wrong) generate a new token
            if (!isvalidToken) {
                const workspace_name = user['workspace_name'];

                let tokens = await auths.generateToken(user._id, workspace_name);

                BearerToken = BearerToken + tokens['token'];
            }

            res.status(200).json({ access_token: BearerToken });
        } else {
            res.status(502).json({ error: ' Can not find token' });
        }

    }

    /** 
     * This function is to get the refresh token
     * @param req 
     * @param res 
     * @param next 
    */
    async newTask(req: Request, res: Response, next: NextFunction) {

        const post = await Post.findOne({ _assigned_to: req['userId'], type: 'task' })
            .populate('_assigned_to').select('first_name last_name profile_pic role email')
            .populate('_group').select('group_name group_avatar workspace_name')
            .populate('_posted_by').select('first_name last_name profile_pic role email')
            .populate({ path: 'task._column', select: '_id title' }).select('task title content tags').sort({ created_date: -1 });

        const user = await User.findById(req['userId']);

        if (user && post) {

            const postData = {
                title: post['title'],
                due: DateTime.fromISO(post['task'].due_to).toISODate(),
                status: post['task'].status,
                groupName: post['_group'].group_name,
                workspaceName: post['_group'].workspace_name,
                section: post['task']._column?.title,
                assigneeEmail: user['email'],
                assigneeName: user['full_name'],
                postByEmail: post['_posted_by'].email,
                postByName: post['_posted_by'].full_name
            }
            res.status(200).json([postData]);
        } else {
            res.status(200).json([]);
        }
    }

    /** 
     * This function is to user's groups for zapier action form
     * @param req 
     * @param res 
     * @param next 
    */
    async groups(req: Request, res: Response, next: NextFunction) {
        const groups = await Group.find({ $or: [{ _members: req['userId'] }, { _admins: req['userId'] }] });
        if (groups && groups?.length > 0) {
            var dataList: any = [];
            groups.forEach(group => {
                dataList.push({
                    id: group._id,
                    label: group['group_name'],
                    value: group._id
                });
            });

            res.status(200).json(dataList);
        } else {
            res.status(200).json([]);
        }
    }

    /** 
     * This function is to get the columns of group for zapier action form
     * @param req 
     * @param res 
     * @param next 
    */
    async columns(req: Request, res: Response, next: NextFunction) {
        const columns = await Column.find({ _group: req.query.groupID });
        if (columns && columns?.length > 0) {
            var dataList: any = [];
            columns.forEach(column => {
                dataList.push({
                    id: column._id,
                    label: column['title'],
                    value: column._id
                });
            });

            res.status(200).json(dataList);
        } else {
            res.status(200).json([]);
        }
    }

    /** 
     * This function is to create task
     * @param req 
     * @param res 
     * @param next 
    */
    async createTask(req: Request, res: Response, next: NextFunction) {

        // Form data
        var formData = new FormData();
        
        // Postdata
        const postdata = {
            "title": req.body?.title,
            "content": req.body?.content,
            "type": "task",
            "_posted_by": req['userId'],
            "_group": req.body?.group,
            "_content_mentions": [],
            "_assigned_to": [],
            "task": {
                "status": "to do",
                "_column": req.body?.colums
            }
        };
        
        formData.append('post', JSON.stringify(postdata));
        
        // Split the authorization header
        const token = req.headers.authorization;

        try {
            //Sending request to post service to create a task.
            const responaxois = await axios({
                url: `${process.env.POSTS_SERVER_API}/null`,
                method: 'POST',
                headers: {
                    'Content-Type': formData.getHeaders()['content-type'],
                    'Authorization': token,
                },
                data: formData
            });

            res.status(200).json({ message: "Successfully" });
        } catch (error) {
            res.status(200).json({ message: "fail" });
        }

    }
}
