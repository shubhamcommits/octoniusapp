import { Response, Request, NextFunction } from "express";
import { IntegrationService } from "../service";
import { SlackAuth, User ,TeamAuth } from '../models';
import { Auths } from '../../utils';
// import { validateId } from "../../utils/helperFunctions";
import axios from "axios";
import { helperFunctions } from '../../utils';

// Creating Service class in order to build wrapper class
const integrationService = new IntegrationService()

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
            const user = await User.findById(req.body.userid);
    
            //Slack connected or not checking
            const isSlackConnected = user?.integrations?.is_slack_connected || false;
            
            //Slack connected or not checking
            const isTeamConnected = user?.integrations?.is_teams_connected || false;
        
            //check any integration here later

            // If Slack connected send notifcation to slack 
            if ( isSlackConnected ) {
                
                // Parsed the notfication and extract required data and format.
                let data = await helperFunctions.parsedNotificationData(req.body);
                
                // Find slack user by _id
                const userOctonius = await SlackAuth.findOne({_user:req.body.userid}).sort({created_date:-1}).populate('_user');
                

                let userSlackWebhookUrl:any;
    
                if(userOctonius && userOctonius != null){
                    
                    // Slack incomming webhook to send notification
                    userSlackWebhookUrl = userOctonius['incoming_webhook'];
                    
                    // Slack instance
                    var slack = require('slack-notify')(userSlackWebhookUrl); 
                    
                    //Send notification to slack
                    integrationService.sendNotificationToSlack(slack,data);

                }  
            } 
            

            if ( isTeamConnected ) {
                
                // Parsed the notfication and extract required data and format.
                let data = await helperFunctions.parsedNotificationData(req.body);
                
                 // Find teams user by id
                const teamsUser = await TeamAuth.findOne({_user:req.body.userid}).sort({created_date:-1}).populate('_user');
                
                // Notificaiton params
                const queryParams = {
                    url: `${process.env.CLIENT_SERVER}/dashboard/work/groups/tasks?group=${data['group_id']}&myWorkplace=false&postId=${data['post_id']}`,
                    name: data['name'],
                    text: data['text'],
                    image: `${process.env.IMAGE_PROCESS_URL}/${data['image']}`,
                    btn_title: data['btn_title'],
                    uid: teamsUser.user_id
                } 
                
                const responce = await axios.post(`${process.env.TEAMS_BOT_URL}/api/proactive`,null,{ params: queryParams});

            }  else {
                return  res.status(200).json({
                    message: 'System can not sent Notification!'
                });
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
