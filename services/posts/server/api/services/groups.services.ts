import { Group } from '../models';
import moment from 'moment';
const fs = require('fs');

/*  ===============================
 *  -- GROUPS Service --
 *  ===============================
 */

export class GroupsService {

  async increaseDoneTasks(groupId: string, increase: number, status: string) {

    let group: any = await Group.findOne({
      $and: [
          { _id: groupId },
          {'records.done_tasks_count.date': moment().format('YYYY-MM-DD') }
      ]
    }).select('_id');

    if (!group) {
      if (status === 'done') {
        group = await Group.findOneAndUpdate({
          _id: groupId,
          'records.done_tasks_count.date': {$ne: moment().format('YYYY-MM-DD') }
        }, { $push: { 'records.done_tasks_count': { date: moment().format('YYYY-MM-DD'), count: 1 }}}
        )
        .select('_id');
      }
    } else {
      group = await Group.findOneAndUpdate({
          _id: groupId,
          "records.done_tasks_count.date": moment().format('YYYY-MM-DD')
      }, {
          $inc: { "records.done_tasks_count.$.count": +increase }
      }, {
          new: true
      })
      .select('_id');
    }

    // Send status 200 response
    return group;
  };
}
