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
                            url: `${process.env.CLIENT_SERVER}/dashboard/work/groups/tasks?group=${data['group_id']}&myWorkplace=false&postId=${data['post_id']}`
                        }]
                }]
            }]
        });
    }

    async disconnectSlack(userId: string) {
        // Find User by user's _id
        var user = await User.findById(userId);

        // Extract the integrations
        var integration = user['integrations'];
        
        // update the is_slack_connected false
        integration.is_slack_connected = false;
        integration.slack = null;

        // Update user integrations
        const updatedUser = await User.findOneAndUpdate({ _id: userId },
            { $set: { integrations: integration }},
            { new: true });

        return updatedUser;
    }
}
