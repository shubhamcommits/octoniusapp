
import { Readable } from 'stream';
import { Group, Post, User } from '../models';
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

    async getGroups(query){
      try {

        console.log("Before Getting data")
        const groupslist = await Group.find(query);
        console.log(groupslist);
        if(groupslist && groupslist.length>0){
          return groupslist;
        } else {
          console.log("There is an error while getting the Group data");
          return {message:"There is an error while getting the Group data"}
        }

      } catch(err) { 
        console.log("There is an error while getting the Group data",err)
      }
    }

    async getUseGrroups(query){
      try {

        console.log("Before Getting data")
        const user = await User.findOne(query);
        console.log(user);
        if(user){
          const groups = await this.getGroups({_admins:user._id});
          return groups;
        } else {
          console.log("There is an error while getting the user data");
          return { message:"There is an error while getting the user data", _id:''}
        }

      } catch(err) { 
        console.log("There is an error while getting the user data",err)
      }
    }
    
}
