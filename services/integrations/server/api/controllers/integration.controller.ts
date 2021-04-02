import { Response, Request, NextFunction } from "express";
import { SlackService, TeamService } from "../service";
import { User, Auth, Post} from '../models'
import jwt from "jsonwebtoken";
import { Auths, sendError } from '../../utils';
import { helperFunctions } from '../../utils';

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
            const isSlackConnected = user?.integrations?.is_slack_connected || false;

            //Slack connected or not checking
            const isTeamConnected = user?.integrations?.is_teams_connected || false;

            // Parsed the notfication and extract required data and format.
            const data = await helperFunctions.parsedNotificationData(req.body);

            // If Slack connected send notifcation to slack 
            if (isSlackConnected && user.integrations.slack) {
                // Slack incomming webhook to send notification
                // Slack instance
                var slack = require('slack-notify')(user?.integrations?.slack?.incoming_webhook);

                //Send notification to slack
                await slackService.sendNotificationToSlack(slack, data);
            }


            if (isTeamConnected && user.integrations.teams) {
                await teamService.sendNotificationToTeam(data, user?.integrations?.teams?.user_id, user?.integrations?.teams?.tenant_id);
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
                const workspace_name = user.workspace_name;

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
    async refreshToken(req: Request, res: Response, next: NextFunction) {
        res.send({hhh:'sdcsfssdsdds'});
    }

    /** 
     * This function is to get the refresh token
     * @param req 
     * @param res 
     * @param next 
    */
     async newTask(req: Request, res: Response, next: NextFunction) {
     
        const post = await Post.findOne({_assigned_to:req['userId'],type:'task'})
        .populate('_assigned_to').select('first_name last_name profile_pic role email' )
        .populate('_group').select('group_name group_avatar workspace_name')
        .populate('_posted_by').select('first_name last_name profile_pic role email')
        .populate({path:'task._column',select:'_id title'}).select('task title content tags').sort({created_date:-1});

        const user = await User.findById(req['userId']);
        
        if(user && post){

            const postData = {
                title: post.title,
                content: post.content,
                due: post?.task?.due_to,
                status: post?.task?.status,
                groupName: post?._group?.group_name,
                workspaceName: post?._group?.workspace_name,
                section: post?.task?._column?.title,
                assigneeEmail: user?.email,
                assigneeName: user?.full_name,
                postByEmail: post?._posted_by?.email, 
                postByName:post?._posted_by?.full_name,
                tags:post?.tags,
                customfields:post?.task?.custom_fields
            }
            res.status(200).json([postData]);
        } else {
            res.status(200).json([]);
        }
    }
}
