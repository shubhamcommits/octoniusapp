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
    async sendNotificationToTeam(data: any, teams_user_id: string, tenant_id:string){

      // Notificaiton params
      const queryParams = {
        url: `${process.env.CLIENT_SERVER}/dashboard/work/groups/tasks?group=${data['group_id']}&myWorkplace=false&postId=${data['post_id']}`,
        name: data['name'],
        text: data['text'],
        image: `${process.env.IMAGE_PROCESS_URL}/${data['image']}`,
        btn_title: data['btn_title'],
        uid: teams_user_id,
        tid:tenant_id
      }

      const responce = await axios.post(`${process.env.TEAMS_BOT_URL}/api/proactive`,null,{ params: queryParams });
      return responce;
  } 
}
