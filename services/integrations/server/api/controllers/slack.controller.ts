import { Response, Request, NextFunction } from "express";
import { SlackService } from "../service";
import { Group, Column, User, SlackAuth } from '../models';
// import { validateId } from "../../utils/helperFunctions";
import axios from "axios";

// Creating Service class in order to build wrapper class
const slackService = new SlackService()

/*  ===============================
 *  -- Slack CONTROLLERS --
 *  ===============================
 */

export class SlackController {

    async slackNotify (req: Request ,res:Response ,next: NextFunction) {
        console.log('slackNotify Function');
        var MY_SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
        var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

        console.log('req.body ==>', req.body);
        const body = req.body.data;
        slack.alert({
            text: body.text,
            attachments: [
                {
                  fallback: 'Required Fallback String',
                  fields: [
                    { value: body.image + " " + body.name, short: true },
                    { value: body.content}
                  ]
                }
              ]
        });

        return  res.status(200).json({
            message: 'Slack Sent Notification successed!'
        });
    }

    async slackWebhook(req: Request , res: Response, next: NextFunction) {
        
        // console.log("req.params",req.headers);
        console.log("req.body",req.body.payload);

        if(req.body.challenge){

            res.status(200).json(req.body.challenge);
        }

        console.log();
        const bosy = req.body.payload;
        // console.log(bosy);
        const bodypay = JSON.parse(bosy);
        // 
        // console.log(bodypay);
        

        res.status(200).json({});

        const user_octonius = await SlackAuth.findOne({slack_user_id:bodypay.user.id}).populate('_user');
        console.log("user_octonius",user_octonius);
        const url_responceback = bodypay.response_url;
        console.log(url_responceback,"url_responceback");
        if(user_octonius && user_octonius!=null){

            if(bodypay.type == "message_action"){
                
                let groupsOption=[];

                

                try{   
                    
                    
                    //  console.log("user_octonius",user_octonius);

                    const user = user_octonius['_user'];

                    console.log("user_octonius",user);

                    if(user){
                        const groups = await Group.find({_admins:user._id});
                        console.log("groups",groups);''
                        for(var i=0;i<groups.length;i++){
                            const grup =  groups[i];
                            groupsOption[i]={
                                "text": {
                                    "type": "plain_text",
                                    "text": grup['group_name'],
                                    "emoji": true
                                },
                                "value": ''+grup['_id'],
                            };
                        }
                    }  
                }catch(err){
                    console.log("Am here in error");
                    console.log(err);
                }
                
                console.log("Group option",groupsOption)

                const triggered = bodypay.trigger_id;
                const message =bodypay.message.text;
                console.log("message",message);
                console.log(triggered);
                const respo = await axios.post('https://slack.com/api/views.open', {
                    trigger_id : triggered,
                    view : {
                    "type": "modal",
                    "title": {
                        "type": "plain_text",
                        "text": "Octonius",
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
                            "type": "input",
                            "element": {
                                "type": "plain_text_input",
                                "action_id": "plain_text_input-action"
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
                                "action_id": "plain_text_input-action",
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
                                "action_id": "static_select-action"
                            },
                            "label": {
                                "type": "plain_text",
                                "text": "Group",
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
                                "options": [
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Column 1",
                                            "emoji": true
                                        },
                                        "value": "value-0"
                                    },
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Column 2",
                                            "emoji": true
                                        },
                                        "value": "value-1"
                                    },
                                    {
                                        "text": {
                                            "type": "plain_text",
                                            "text": "Column 3",
                                            "emoji": true
                                        },
                                        "value": "value-2"
                                    }
                                ],
                                "action_id": "static_select-action"
                            },
                            "label": {
                                "type": "plain_text",
                                "text": "Column",
                                "emoji": true
                            }
                        },
                        {
                            "type": "input",
                            "element": {
                                "type": "datepicker",
                                "initial_date": "1990-04-28",
                                "placeholder": {
                                    "type": "plain_text",
                                    "text": "Select a date",
                                    "emoji": true
                                },
                                "action_id": "datepicker-action"
                            },
                            "label": {
                                "type": "plain_text",
                                "text": "Due date",
                                "emoji": true
                            }
                        },
                        {
                            "type": "input",
                            "element": {
                                "type": "multi_users_select",
                                "placeholder": {
                                    "type": "plain_text",
                                    "text": "Select users",
                                    "emoji": true
                                },
                                "action_id": "multi_users_select-action"
                            },
                            "label": {
                                "type": "plain_text",
                                "text": "Assignmed to",
                                "emoji": true
                            }
                        }
                    ]
                }},{ headers: { authorization: `Bearer `+process.env.SLACK_BOT_ACCESS_TOKEN } });
                
                console.log("responce",respo.data);

            

            } else if (bodypay.type == "view_submission"){
                

                const triggered_id_2 = bodypay.trigger_id;
                const respo = await axios.post('https://slack.com/api/views.open', {
                trigger_id : triggered_id_2,
                view : {
                    "type": "modal",
                    "title": {
                        "type": "plain_text",
                        "text": "Notification",
                        "emoji": true
                    },
                    "close": {
                        "type": "plain_text",
                        "text": "Cancel",
                        "emoji": true
                    },
                    "blocks": [
                        {
                            "type": "section",
                            "text": {
                                "type": "mrkdwn",
                                "text": "*Thanks for your request, we'll process it and get back to you.* :smile:"
                            }
                        }
                    ]
                }
                },{ headers: { authorization: `Bearer `+process.env.SLACK_BOT_ACCESS_TOKEN } });

                console.log("responce",respo.data);
            
            }
        } else {
            const respo = await axios.post(url_responceback,{
                    text: "UnAuthorized User please connect you with us from your Octonius workspace"
                },{ headers: { authorization: `Bearer `+process.env.SLACK_BOT_ACCESS_TOKEN } })
                console.log("responce",respo.data);
        }
       
        // res.status(200).json(true);        
    }


    async authSlack(req: Request , res: Response, next: NextFunction){
        
        console.log("req.body",req.body);
        
        const responce = await axios.get('https://slack.com/api/oauth.v2.access', { params: { code: req.body.code, client_id: process.env.SLACK_CLINET_ID ,client_secret:process.env.SLACK_CLIENT_SECRET} });
        
        const resp = responce.data;
        console.log("resp",resp);
        if(resp['ok']){
            const slack_user = resp['authed_user'];
            const team = resp['team'];
            const incoming_webhook = resp['incoming_webhook'];
            const slack_auth = new SlackAuth({
                token: slack_user.access_token,
                slack_user_id: slack_user.id,
                _user:req.body.user._id,
                team_name:team.name,
                team_id:team.id,
                incoming_webhook:incoming_webhook.url
            });
            await slack_auth.save();
            console.log(slack_auth);
            res.status(200).json(resp);
        } else {
            res.status(400).json(resp);
        }

    }
}
