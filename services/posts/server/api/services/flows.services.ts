import { Flow } from '../models';
import { GroupsService } from './groups.services';

/*  ===============================
 *  -- POSTS Service --
 *  ===============================
 */

export class FlowService {

  groupsService = new GroupsService();
  
  /**
   * This function fetches the automation flows of a group
   * @param groupId
   */
  async getAutomationFlows(groupId: string) {
    const flows = await Flow.find({
        _group: groupId
    })
    .populate({
        path: 'steps.trigger._user',
        select: 'first_name last_name profile_pic created_date'
    })
    .populate({
        path: 'steps.action._user',
        select: 'first_name last_name profile_pic created_date'
    })
    .lean();

    return flows;
  };
}
