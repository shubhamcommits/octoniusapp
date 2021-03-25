import { Response, Request, NextFunction } from "express";
import { SlackService , TeamService} from "../service";
import { User } from '../models';
import { Auths } from '../../utils';
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
    async notify (req: Request ,res:Response ,next: NextFunction) {
        

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
            

            if ( isTeamConnected && user.integrations.teams ) {            
                await teamService.sendNotificationToTeam(data, user?.integrations?.teams?.user_id);
            }
            
        } catch (error) {
            return  res.status(200).json({
                message: 'System can not sent Notification!'
            });
        }

        return  res.status(200).json({
            message: 'System Sent Notification successed!'
        });
        
    }
}
