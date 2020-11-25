
import { Readable } from 'stream';
var MY_SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

/*  ===============================
 *  -- Slack Service --
 *  ===============================
 */

export class SlackService {

    async slackNotification(comment_data) {
    
        console.log('inside slackNotification');
        try {
            // Call Service Function for likeComment
            slack.alert({
                text: comment_data.text,
                attachments: [
                    {
                      fallback: 'Required Fallback String',
                      fields: [
                        { value: comment_data.image + " " + comment_data.name, short: true },
                        { value: comment_data.content}
                      ]
                    }
                  ]
            });
            // Send status 200 response
            return true;
        } catch (err) {
            // Error Handling
            throw err;
        }
    }
}
