import e, { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
import moment from 'moment/moment'
import { Group, Column, Auth, User } from '../models';
import { Auths, sendError } from '../../utils';
import FormData from 'form-data';
// import { validateId } from "../../utils/helperFunctions";
import axios from "axios";


/*  ===============================
 *  -- Slack CONTROLLERS --
 *  ===============================
 */
// Authentication Utilities Class
const auths = new Auths();

export class SlackController {

    /** 
     * This function is responsible to show the task creation pop up modal to slack 
     * @param req 
     * @param res 
     * @param next 
     */
    async slackWebhook(req: Request , res: Response, next: NextFunction) {
        
        // If body contain challenge return back the challenge
        if(req.body.challenge){
            res.status(200).json(req.body.challenge);
            return;
        } else {
            res.status(200).json({});
        }

        try {

            // Payload data from req.body
            const bodyPayload = req.body.payload;

            let parsedBodyPayLoad:any;
            
            // If payload parsed to json
            if(bodyPayload){

                parsedBodyPayLoad = JSON.parse(bodyPayload);
            }
            
            // responce url for slack urlResponceBack
            const urlResponceBack = parsedBodyPayLoad?.response_url;

            //Find user from slack auth with slack_user_id.
            const userOctonius = await User.findOne({'integrations.slack.slack_user_id': parsedBodyPayLoad.user.id });

            // Bot Access Token
            var botAccessToken ;

            // If user founded
            if (userOctonius && userOctonius!=null) {
                
                // Bot Access Token
                botAccessToken = userOctonius['integrations'].slack.bot_access_token;

                // Bearer Token
                var BearerToken = "Bearer ";

                // Find user authentication
                const userAuth = await Auth.findOne({_user: userOctonius._id}).sort({created_date:-1});
                // Token
                const token = userAuth['token'];
                //Token validation bit
                var isvalidToken = true;
                
                //If token is exist varify the token from jwt
                if(token && token != null){
                    jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
                        if (err || !decoded) {
                            isvalidToken = false;
                            sendError(res, err, 'Unauthorized request, it must have a valid authorization token!', 500);
                        } else {
                            // Assigning and feeding the userId into the req object
                            BearerToken = BearerToken+token;
                        }
                    });
                } else {
                    isvalidToken = false;
                }

                // If token is not valid (i.e expired, wrong) generate a new token
                if(!isvalidToken){
                    const workspace_name = userOctonius['workspace_name'];

                    let tokens = await auths.generateToken(userOctonius._id, workspace_name);

                    BearerToken = BearerToken + tokens['token'];
                }

                // If action type is message_action show first initial task creation popup modal
                if (parsedBodyPayLoad.type == "message_action") {
                    
                    // Groups options for dropdown
                    let groupsOption=[];

                    try {
                        // If user get groups data
                        if (userOctonius) {
                            // Find groups admin with user _id where user is admin
                            let groupsByAdmin = await Group.find({_admins:userOctonius._id});
                            // Find groups admin with user _id where user is member
                            let groupsByMember = await Group.find({_members:userOctonius._id});
                            // Merge the member groups to admin groups
                            groupsByMember.forEach(groups => {
                                groupsByAdmin.push(groups);
                            });

                            // Loop groups to create options for dropdown
                            for (var i = 0 ; i < groupsByAdmin.length; i++ ) {
                                
                                const group =  groupsByAdmin[i];
                                
                                groupsOption[i] = {
                                    "text": {
                                        "type": "plain_text",
                                        "text": group['group_name'],
                                        "emoji": true
                                    },
                                    "value": ''+group['_id'],
                                };
                            }
                        }  
                    } catch(err) {
                        console.log(err);
                    }
                
                    const triggered = parsedBodyPayLoad.trigger_id;
                    
                    const message = parsedBodyPayLoad.message.text;

                    // Send first Create Task popup modal schema to slack.
                    const respo = await axios.post('https://slack.com/api/views.open', {
                        trigger_id : triggered,
                        view : {
                        "type": "modal",
                        "callback_id": "step_1",
                        "title": {
                            "type": "plain_text",
                            "text": "Octonius",
                            "emoji": true
                        },
                        "submit": {
                            "type": "plain_text",
                            "text": "Continue",
                            "emoji": true
                        },
                        "close": {
                            "type": "plain_text",
                            "text": "Cancel",
                            "emoji": true
                        },
                        "blocks": [
                            {
                                "type": "input",
                                "element": {
                                    "type": "plain_text_input",
                                    "action_id": "title_action"
                                },
                                "label": {
                                    "type": "plain_text",
                                    "text": "Title*",
                                    "emoji": true
                                }
                            },
                            {
                                "type": "input",
                                "element": {
                                    "type": "plain_text_input",
                                    "multiline": true,
                                    "action_id": "message_action",
                                    "initial_value":message
                                },
                                "label": {
                                    "type": "plain_text",
                                    "text": "Description",
                                    "emoji": true
                                }
                            },
                            {
                                "type": "input",
                                "element": {
                                    "type": "static_select",
                                    "placeholder": {
                                        "type": "plain_text",
                                        "text": "Select an item",
                                        "emoji": true
                                    },
                                    "options": groupsOption,
                                    "action_id": "group_selected"
                                },
                                "label": {
                                    "type": "plain_text",
                                    "text": "Group",
                                    "emoji": true
                                }
                            },
                        ]
                    }},{ headers: { authorization: `Bearer `+botAccessToken } });
                    
                // If type is view_submission create and send the second Create Task popup to slack or save task
                } else if (parsedBodyPayLoad.type == "view_submission"){
                    // View have the first modal submission data
                    const view = parsedBodyPayLoad.view;

                    // call back id
                    const callback = view.callback_id;

                    // triggered ID
                    const triggeredId2 = parsedBodyPayLoad.trigger_id;

                    // If step_1 create and send the second Create Task popup to slack
                    if(callback == 'step_1') {

                        // Current Date
                        const currentDate = moment().format("YYYY-MM-DD");
                        
                        //Sate value
                        const values = view.state.values;

                        // variables title, description, group, groupId
                        var title:any, description:any, groupName:any, groupId:any;
                        
                        // Extract the data from the view values submitted from slack
                        Object.keys(values).forEach(function(key) {
                            var val = values[key];
                            if(val && val.title_action)
                            {
                                title=val.title_action.value;

                            }else if(val && val.message_action)
                            {
                                description=val.message_action.value;
                            }
                            else if(val && val.group_selected.selected_option){

                                groupName=val.group_selected.selected_option.text;
                                groupId=val.group_selected.selected_option.value;

                            }
                        });

                        // Find ColumnsList by group id
                        const ColumnsList = await Column.find({_group:groupId});
                        // Find groupData by group id
                        const groupData = await Group.findOne({_id:groupId}).populate('_members').populate('_admins');
                        
                        //Column Options
                        let columnOption:any = [];
                        
                        //User options
                        let userOption:any = [] ;

                        // Loop colums list and create Columnsoptions
                        for (var i = 0 ; i < ColumnsList.length ; i++){
                            
                            const columnData = ColumnsList[i];

                            columnOption.push(
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": columnData['title'],
                                        "emoji": true
                                    },
                                    "value":''+columnData['_id']
                                }
                            );
                        }

                        // Group members
                        var groupMembers = groupData['_members'];

                        //  Loop groupMembers and create userOptions
                        for (var i=0;i < groupMembers.length;i++){
                            userOption.push(
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": groupMembers[i].full_name,
                                        "emoji": true
                                    },
                                    "value":''+groupMembers[i]._id
                                }
                            );
                        }

                        // Group admins
                        var groupAdmins = groupData['_admins'];

                        //  Loop groupAdmins and create userOptions
                        for (var i=0;i < groupAdmins.length;i++){
                            userOption.push(
                                {
                                    "text": {
                                        "type": "plain_text",
                                        "text": groupAdmins[i].full_name,
                                        "emoji": true
                                    },
                                    "value":''+groupAdmins[i]._id
                                }
                            );
                        }

                        //sending second popup schema to slack to show second popup Create Task
                        const respo = await axios.post('https://slack.com/api/views.open', {
                        trigger_id : triggeredId2,
                        view : {
                            "type": "modal",
                            "callback_id": groupId,
                            "title": {
                                "type": "plain_text",
                                "text": "Add Task",
                                "emoji": true
                            },
                            "submit": {
                                "type": "plain_text",
                                "text": "Submit",
                                "emoji": true
                            },
                            "close": {
                                "type": "plain_text",
                                "text": "Cancel",
                                "emoji": true
                            },
                            "blocks": [
                                {
                                    "type": "header",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Title:",
                                        "emoji": true
                                    }
                                },
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "mrkdwn",
                                        "text": title
                                    }
                                },
                                {
                                    "type": "header",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Description:",
                                        "emoji": true
                                    }
                                },
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "mrkdwn",
                                        "text": description
                                    }
                                },
                                {
                                    "type": "header",
                                    "text": {
                                        "type": "plain_text",
                                        "text": "Group:",
                                        "emoji": true
                                    }
                                },
                                {
                                    "type": "section",
                                    "text": {
                                        "type": "mrkdwn",
                                        "text": groupName.text
                                    }
                                },
                                {
                                    "type": "input",
                                    "element": {
                                        "type": "static_select",
                                        "placeholder": {
                                            "type": "plain_text",
                                            "text": "Select an item",
                                            "emoji": true
                                        },
                                        "options": columnOption,
                                        "action_id": "column_select_action"
                                    },
                                    "label": {
                                        "type": "plain_text",
                                        "text": "Columns",
                                        "emoji": true
                                    }
                                },
                                {
                                    "type": "input",
                                    "element": {
                                        "type": "datepicker",
                                        "initial_date": currentDate,
                                        "placeholder": {
                                            "type": "plain_text",
                                            "text": "Select a date",
                                            "emoji": true
                                        },
                                        "action_id": "datepicker_action"
                                    },
                                    "label": {
                                        "type": "plain_text",
                                        "text": "Deadline",
                                        "emoji": true
                                    }
                                },
                                {
                                    "type": "input",
                                    "element": {
                                        "type": "static_select",
                                        "placeholder": {
                                            "type": "plain_text",
                                            "text": "Select an item",
                                            "emoji": true
                                        },
                                        "options": userOption,
                                        "action_id": "user_select_action"
                                    },
                                    "label": {
                                        "type": "plain_text",
                                        "text": "Assigned To",
                                        "emoji": true
                                    }
                                }
                            ]
                        }
                        },
                        { headers: { authorization: `Bearer `+botAccessToken } });
                    } 
                    // If not step_1 save task to octonius and send success or failer popup to slack.
                    else if(callback != 'step_1'){
                        
                        // View submission second task popup from slack
                        const view = parsedBodyPayLoad.view;
                        // blocks
                        const blocks = view.blocks;
                        // callback
                        const callback = view.callback_id;
                        // view state value
                        const values = view.state.values;

                        // variables column, date, user
                        var column:any, date:any, user:any;
                        
                        //Extracting data from view state value
                        Object.keys(values).forEach(function(key) {
                            var val = values[key];
                            if(val && val.column_select_action)
                            {
                                column = val.column_select_action.selected_option.value;

                            }else if(val && val.datepicker_action)
                            {
                                date = val.datepicker_action.selected_date;
                            }
                            else if(val && val.user_select_action){

                                user = val.user_select_action.selected_option.value;
                            }
                        });

                        // task title
                        const title = blocks[1].text.text;
                        // task description
                        const description = blocks[3].text.text;
                        // task group name
                        const group = blocks[5].text.text;

                        // taskdata
                        const taskData = {
                            title, description, groupId: callback
                        }

                        // form data
                        var formData = new FormData();

                        // Postdata
                        const postData = {"title": taskData.title,"content": taskData.description,"type":"task","_posted_by": userOctonius._id,"_group": taskData.groupId,"_content_mentions":[],"_assigned_to": user,"task":{"status":"to do","_column": column,"due_to": moment(date).format("YYYY-MM-DD")}};

                        formData.append('post',JSON.stringify(postData));

                        // Axios call to create task

                        try {
                        
                            const responaxois = await axios({
                                url : process.env.POSTS_SERVER_API,
                                method:'POST',
                                headers:{
                                    'Content-Type': formData.getHeaders()['content-type'],
                                    'Authorization': BearerToken,
                                },
                                data:formData
                            });

                            // Send Success message popup to slack
                            const respo = await axios.post('https://slack.com/api/views.open', {
                                trigger_id: triggeredId2,
                                view: {
                                        "type": "modal",
                                        "title": {
                                            "type": "plain_text",
                                            "text": "Notification",
                                            "emoji": true
                                        },
                                        "close": {
                                            "type": "plain_text",
                                            "text": "OK",
                                            "emoji": true
                                        },
                                        "blocks": [
                                            {
                                                "type": "section",
                                                "text": {
                                                    "type": "mrkdwn",
                                                    "text": "*Task Created ...* :smile:"
                                                }
                                            }
                                        ]
                                    }
                                },
                                { headers: { authorization: `Bearer `+botAccessToken } });
                        } catch(err){
                            
                            // Send error message popup to slack
                            const respo = await axios.post('https://slack.com/api/views.open', {
                            trigger_id: triggeredId2,
                            view: {
                                    "type": "modal",
                                    "title": {
                                        "type": "plain_text",
                                        "text": "Notification",
                                        "emoji": true
                                    },
                                    "close": {
                                        "type": "plain_text",
                                        "text": "OK",
                                        "emoji": true
                                    },
                                    "blocks": [
                                        {
                                            "type": "section",
                                            "text": {
                                                "type": "mrkdwn",
                                                "text": "*There was an error while creating task...!!!* :smile:"
                                            }
                                        }
                                    ]
                                }
                            },
                            { headers: { authorization: `Bearer `+botAccessToken } });
                        }
                    }
                }
            } else {
                const respo = await axios.post(urlResponceBack,{
                        text: "UnAuthorized User! Please connect your Octonius workspace to slack"
                    },{ headers: { authorization: `Bearer `+botAccessToken } })
            }

        } catch(err) {
            console.log(err);
        }
       
        // res.status(200).json(true);        
    }

    /** 
     * This function is responsible to autenticate use with slack and save authentication data
     * @param req 
     * @param res 
     * @param next 
     */
    async authSlack(req: Request , res: Response, next: NextFunction){
        
        // validate the code and get the slack user data
        const responce = await axios.get('https://slack.com/api/oauth.v2.access', {
            params: {
                code: req.body.code,
                client_id: process.env.SLACK_CLIENT_ID,
                client_secret: process.env.SLACK_CLIENT_SECRET
            }
        });
        
        const slackUserData = responce.data;

        if(slackUserData['ok']){
            
            const slack_user = slackUserData['authed_user'];
            const team = slackUserData['team'];
            const incoming_webhook = slackUserData['incoming_webhook'];
            
            // Create slack auth record
            const slack_auth = {
                token: slack_user.access_token,
                slack_user_id: slack_user.id,
                team_name: team.name,
                team_id: team.id,
                incoming_webhook: incoming_webhook.url,
                bot_access_token: slackUserData['access_token']
            };

            // Find user by id 
            var user = await User.findById(req.body.user._id);

            // Extract integrations
            var integration = user['integrations'];

            //Update is_slack_connected to true
            integration['is_slack_connected']=true;
            integration.slack = slack_auth;

            // Update the user's integrationd
            const update_user = await User.findOneAndUpdate({ _id: req.body.user._id },
                { $set: { integrations: integration }},
                { new: true });

            res.status(200).json(update_user);

        } else {

            res.status(400).json(slackUserData);
        }

    }

    /** 
     * This function is responsible to check the slack is conneted
     * @param req 
     * @param res 
     * @param next 
     */
    async isSlackAuth(req: Request , res: Response, next: NextFunction){
        // Find slack user from slacKAuth by salck userId
        const user = await User.findOne({_id:req.params.userID}).select('integrations');
        
        // If SlackData exist user authenticated.
        if (user && user['integrations'] && user['integrations'].slack) {

            res.status(200).json({message:"Connected to slack",connect:true});

        } else {

            res.status(200).json({message:"Not Connected to slack",connect:false});
        }

    };

    /**     
     * This function is responsible to diconnect the slack from octonius 
     * @param req 
     * @param res 
     * @param next 
     */
    async disconnectSlack(req: Request , res: Response, next: NextFunction){
        try {
            // Find User by user's _id
            var user = await User.findById(req.params.userID);

            // Extract the integrations
            var integration = user['integrations'];
            
            // update the is_slack_connected false
            integration.is_slack_connected = false;
            integration.slack = null;

            // Update user integrations
            const updatedUser = await User.findOneAndUpdate({ _id: req.params.userID },
                { $set: { integrations: integration }},
                { new: true });
        
            res.status(200).json({message:"Diconnected Successfully"});

        } catch (err){
            res.status(400).json({message:"Can not disconnet",error:err});
        }
    };
}
