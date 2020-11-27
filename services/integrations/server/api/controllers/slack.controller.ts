import { Response, Request, NextFunction } from "express";
import { SlackService } from "../service";
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
        const triggered = bodypay.trigger_id;
        const message =bodypay.message.text;
        console.log("message",message);
        console.log(triggered);

        res.status(200).json({});
        

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
                        "options": [
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Group 1",
                                    "emoji": true
                                },
                                "value": "value-0"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Group 2",
                                    "emoji": true
                                },
                                "value": "value-1"
                            },
                            {
                                "text": {
                                    "type": "plain_text",
                                    "text": "Group 3",
                                    "emoji": true
                                },
                                "value": "value-2"
                            }
                        ],
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
        }},{ headers: { authorization: `Bearer xoxb-2561616476-1145480914898-ZsfVHdAWEP9Xkq9lhjJdXbSa` } })
        
        console.log("responce",respo.data);
        // res.status(200).json(true);        
    }
}
