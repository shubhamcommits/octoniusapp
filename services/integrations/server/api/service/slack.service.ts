/*  ===============================
 *  -- Slack Service --
 *  ===============================
 */

import { User } from "../models";

export class SlackService {
    
    /** 
     * This function is responsible to send Notification to slack
     * @param slack 
     * @param data 
     */
    async sendNotificationToSlack(slack: any, data: any){
        
        slack.alert({
            text: data['text'],
            attachments: [{
                blocks: [{
                    type: "context",
                        elements: [{
                                type: "image",
                                image_url: `${process.env.IMAGE_PROCESS_URL}/${data['image']}`,
                                alt_text: "avatar_img"
                            },
                            {
                                type: "mrkdwn",
                                text: data['name']
                            }]
                },
                {
                    "type": "actions",
                    "elements": [{
                            "type": "button",
                            "text": {
                                "type": "plain_text",
                                "text": data['btn_title'],
                                "emoji": true
                            },
                            url: data['itemUrl']
                        }]
                }]
            }]
        });
    }
}
