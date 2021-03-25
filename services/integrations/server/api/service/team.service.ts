import axios from "axios";
/*  ===============================
 *  -- Team Service --
 *  ===============================
 */

export class TeamService {
    
    /** 
     * This function is responsible to send Notification to Team
     * @param data 
     */
    async sendNotificationToTeam(data:any){

        const responce = await axios.post(`${process.env.TEAMS_BOT_URL}/api/proactive`,null,{ params: data});
        return responce;
  } 
}
