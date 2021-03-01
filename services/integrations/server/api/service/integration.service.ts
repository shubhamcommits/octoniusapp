
import { Readable } from 'stream';
import { Group, Post, User } from '../models';
var MY_SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
var slack = require('slack-notify')(MY_SLACK_WEBHOOK_URL);

/*  ===============================
 *  -- Integration Service --
 *  ===============================
 */

export class IntegrationService {
  
    async getGroups(query){
      try {

        const groupslist = await Group.find(query);
        if(groupslist && groupslist.length>0){
          return groupslist;
        } else {
          return {message:"There is an error while getting the Group data"}
        }

      } catch(err) { 
      }
    }

    async getUseGrroups(query){
      try {

        const user = await User.findOne(query);
        if(user){
          const groups = await this.getGroups({_admins:user._id});
          return groups;
        } else {
          return { message:"There is an error while getting the user data", _id:''}
        }

      } catch(err) { 
      }
    }
    
}
