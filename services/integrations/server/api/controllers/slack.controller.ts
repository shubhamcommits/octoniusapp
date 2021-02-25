import e, { Response, Request, NextFunction } from "express";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { SlackService } from "../service";
import moment from 'moment/moment'
import { Group, Column, Auth, SlackAuth, User } from '../models';
import { Auths, sendError } from '../../utils';
import FormData from 'form-data';
// import { validateId } from "../../utils/helperFunctions";
import axios from "axios";
import { connect } from "mongoose";
import { helperFunctions } from '../../utils';

// Creating Service class in order to build wrapper class
const slackService = new SlackService()

/*  ===============================
 *  -- Slack CONTROLLERS --
 *  ===============================
 */
// Authentication Utilities Class
const auths = new Auths();

export class SlackController {

    async slackNotify (req: Request ,res:Response ,next: NextFunction) {
        
        if(req.body.type){
            let data = await helperFunctions.sendSlackNotification(req.body);
            console.log("data",data);
            const user_octonius = await SlackAuth.findOne({_user:req.body.userid}).sort({created_date:-1}).populate('_user');
            var MY_SLACK_WEBHOOK_URL;

            if(user_octonius && user_octonius != null){
                MY_SLACK_WEBHOOK_URL = user_octonius['incoming_webhook'];
            }
            var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL); 
            // const body = JSON.parse(req.body.data);
            slack.alert({
                text: data['text'],
                attachments: [
                    {
                        blocks: [
                            {
                                type: "context",
                                elements: [
                                    {
                                        type: "image",
                                        image_url: `${process.env.IMAGE_PROCESS_URL}/${data['image']}`,
                                        alt_text: "avatar_img"
                                    },
                                    {
                                        type: "mrkdwn",
                                        text: data['name']
                                    }
                                ]
                            },
                            {
                                "type": "actions",
                                "elements": [
                                    {
                                        "type": "button",
                                        "text": {
                                            "type": "plain_text",
                                            "text": data['btn_title'],
                                            "emoji": true
                                        },
                                        url: `${process.env.CLIENT_SERVER}/dashboard/work/groups/tasks?group=${data['group_id']}&myWorkplace=false&postId=${data['post_id']}`
                                    }
                                ]
                            }
                        ]
                    }
                ]
            });

        } else {
            console.log("am here in else")
            const user_octonius = await SlackAuth.findOne({_user:req.body.userid}).sort({created_date:-1}).populate('_user');
            var MY_SLACK_WEBHOOK_URL;
    
            if(user_octonius && user_octonius != null){
                MY_SLACK_WEBHOOK_URL = user_octonius['incoming_webhook'];
            }
            var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL); 
            const body = JSON.parse(req.body.data);
            slack.alert({
                text: body.text,
                attachments: [
                    {
                        blocks: [
                            {
                                type: "context",
                                elements: [
                                    {
                                        type: "image",
                                        image_url: `${process.env.IMAGE_PROCESS_URL}/${body.image}`,
                                        alt_text: "avatar_img"
                                    },
                                    {
                                        type: "mrkdwn",
                                        text: body.name
                                    }
                                ]
                            },
                            {
                                "type": "actions",
                                "elements": [
                                    {
                                        "type": "button",
                                        "text": {
                                            "type": "plain_text",
                                            "text": body.btn_title,
                                            "emoji": true
                                        },
                                        url: `${process.env.CLIENT_SERVER}/dashboard/work/groups/tasks?group=${body.group_id}&myWorkplace=false&postId=${body.post_id}`
                                    }
                                ]
                            }
                        ]
                    }
                  ]
            });
        }

      
        

        return  res.status(200).json({
            message: 'Slack Sent Notification successed!'
        });
        
    }

    async slackWebhook(req: Request , res: Response, next: NextFunction) {
        
        if(req.body.challenge){
            res.status(200).json(req.body.challenge);
            return;

        } else {
            res.status(200).json({});
        }

        try {

        const bodyPayload = req.body.payload;

        let bodypay:any;

        if(bodyPayload){

            bodypay = JSON.parse(bodyPayload);
        }
        
        const url_responceback = bodypay?.response_url;

        

        const user_octonius = await SlackAuth.findOne({slack_user_id:bodypay.user.id}).sort({created_date:-1}).populate('_user');
        
        
        var botAccessToken ;

        if(user_octonius && user_octonius!=null){
        
        const _id = user_octonius['_user']._id;
        
        botAccessToken = user_octonius['bot_access_token'];


        var BearerToken = "Bearer ";
        const user_auth = await Auth.findOne({_user:_id}).sort({created_date:-1});
        const token = user_auth['token'];
        var isvalidToken = true;

        await jwt.verify(token, process.env.JWT_KEY, (err, decoded) => {
            if (err || !decoded) {
                isvalidToken = false;
                sendError(res, err, 'Unauthorized request, it must have a valid authorization token!', 500);
            } else {
                // Assigning and feeding the userId into the req object
                BearerToken = BearerToken+token;
            }
        });

        if(!isvalidToken){
            const user = user_octonius['_user']._id;
            const workspace_name = user_octonius['_user'].workspace_name;
            
            let tokens = await auths.generateToken(user, workspace_name);

            BearerToken = BearerToken+tokens['token'];

        }
       
       

        

            if(bodypay.type == "message_action"){
                
                let groupsOption=[];

                try {   
                    
                    const user = user_octonius['_user'];


                    if(user){
                        let groupsbyadmin = await Group.find({_admins:user._id});
                        let groupsbymember = await Group.find({_members:user._id});
                        groupsbymember.forEach(groups => {
                            groupsbyadmin.push(groups);
                        });

                        for(var i=0;i<groupsbyadmin.length;i++){
                            const grup =  groupsbyadmin[i];
                            groupsOption[i] = {
                                "text": {
                                    "type": "plain_text",
                                    "text": grup['group_name'],
                                    "emoji": true
                                },
                                "value": ''+grup['_id'],
                            };
                        }
                    }  
                } catch(err) {
                    console.log(err);
                }
            
                const triggered = bodypay.trigger_id;
                const message = bodypay.message.text;

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
                

            

            } else if (bodypay.type == "view_submission"){
                
                const view = bodypay.view;
                const callback = view.callback_id;
                const triggered_id_2 = bodypay.trigger_id;

                if(callback == 'step_1') {

                    const current_date = moment().format("YYYY-MM-DD");
               
                    const values = view.state.values;
                    var title,description,group,groupid;
                    
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

                            group=val.group_selected.selected_option.text;
                            groupid=val.group_selected.selected_option.value;

                        }
                    });


                    const callbackdata = {
                        title,description,group,groupid
                    }

                    
                    const resp = await Column.find({_group:groupid});

                    const grpresp = await Group.findOne({_id:groupid}).populate('_members').populate('_admins');
                    
                    const columns = resp;
                    let columnoption = [];
                    let useroption = [] ;
                    for (var i=0;i < columns.length;i++){
                        
                        const columndata = columns[i];

                        columnoption.push(
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": columndata['title'],
                                    "emoji": true
                                },
                                "value":''+columndata['_id']
                            }
                        );
                    }

                    var userdata = grpresp['_members'];

                    for (var i=0;i < userdata.length;i++){
                        useroption.push(
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": userdata[i].full_name,
                                    "emoji": true
                                },
                                "value":''+userdata[i]._id
                            }
                        );
                    }
                   

                    var useradmin = grpresp['_admins'];

                    for (var i=0;i < useradmin.length;i++){
                        useroption.push(
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": useradmin[i].full_name,
                                    "emoji": true
                                },
                                "value":''+useradmin[i]._id
                            }
                        );
                    }

                    const respo = await axios.post('https://slack.com/api/views.open', {
                    trigger_id : triggered_id_2,
                    view : {
                        "type": "modal",
                        "callback_id": groupid,
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
                                    "text": group.text
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
                                    "options": columnoption,
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
                                    "initial_date": current_date,
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
                                    "options": useroption,
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
                    },{ headers: { authorization: `Bearer `+botAccessToken } });


                } else if(callback != 'step_1'){
                    
                    const view = bodypay.view;
                    const blocks = view.blocks;
                    const callback = view.callback_id;
                    const values = view.state.values;
                    var column,date,user;
                    
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


                    const title = blocks[1].text.text;
                    const description = blocks[3].text.text;
                    const group = blocks[5].text.text;

                    const taskdata = {
                        title,description,groupid:callback
                    }
                   

                    //Creating task 

                    //form data
                    var formData = new FormData();

                    //Postdata
                    const postdata = {"title": taskdata.title,"content": taskdata.description,"type":"task","_posted_by":_id,"_group": taskdata.groupid,"_content_mentions":[],"_assigned_to": user,"task":{"status":"to do","_column": column,"due_to": moment(date).format("YYYY-MM-DD")}};


                    formData.append('post',JSON.stringify(postdata));

                    //axios call to create task

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




                        const respo = await axios.post('https://slack.com/api/views.open', {
                            trigger_id : triggered_id_2,
                            view : 
                            {
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
                            },{ headers: { authorization: `Bearer `+botAccessToken } });


                    } catch(err){

                        const respo = await axios.post('https://slack.com/api/views.open', {
                        trigger_id : triggered_id_2,
                        view : 
                        {
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
                        },{ headers: { authorization: `Bearer `+botAccessToken } });


                    }

                    
                }
            }
        } else {
            const respo = await axios.post(url_responceback,{
                    text: "UnAuthorized User! Please connect your Octonius workspace to slack"
                },{ headers: { authorization: `Bearer `+botAccessToken } })
        }

        } catch(err) {
            console.log(err);
        }
       
        // res.status(200).json(true);        
    }


    async authSlack(req: Request , res: Response, next: NextFunction){
        
        
        const responce = await axios.get('https://slack.com/api/oauth.v2.access', { params: { code: req.body.code, client_id: process.env.SLACK_CLIENT_ID ,client_secret:process.env.SLACK_CLIENT_SECRET} });
        
        const resp = responce.data;
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
                incoming_webhook:incoming_webhook.url,
                bot_access_token:resp['access_token']
            });

            var user = await User.findById(req.body.user._id);

            var integration = user['integrations'];
            
            integration['is_slack_connected']=true;


            const update_user = await User.findOneAndUpdate({_id:req.body.user._id},{$set:{integrations:integration}},{new:true});
            
            
            await slack_auth.save();
            res.status(200).json(resp);
        } else {
            res.status(400).json(resp);
        }

    }

    async isSlackAuth(req: Request , res: Response, next: NextFunction){
        
        const slack_auth = await SlackAuth.findOne({_user:req.params.userID}).sort({created_date:-1});


        if(slack_auth && slack_auth!=null){
            res.status(200).json({message:"Connected to slack",connect:true});
        } else {
            res.status(200).json({message:"Not Connected to slack",connect:false});
        }

    };

    async disconnectSlack(req: Request , res: Response, next: NextFunction){
        

        try {

            await SlackAuth.deleteMany({_user:req.params.userID});

            var user = await User.findById(req.params.userID);

            var integration = user['integrations'];
            
            integration['is_slack_connected']=false;

            const update_user = await User.findOneAndUpdate({_id:req.params.userID},{$set:{integrations:integration}},{new:true});
            

            res.status(200).json({message:"Diconnected Successfully"});

        } catch (err){

            res.status(400).json({message:"Can not disconnet",error:err});
        }

    };



}
