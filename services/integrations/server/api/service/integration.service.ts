
import { Readable } from 'stream';
import { Group, Post, User } from '../models';
var MY_SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

/*  ===============================
 *  -- Integration Service --
 *  ===============================
 */

export class IntegrationService {


  async sendNotificationToSlack(slack:any,data:any){
        
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
  } 
}
