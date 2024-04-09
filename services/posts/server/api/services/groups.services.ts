import { Group } from '../models';
import { DateTime } from 'luxon';

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
          {'records.done_tasks_count.date': DateTime.now().toISODate() }
      ]
    }).select('_id');

    if (!group) {
      if (status === 'done') {
        group = await Group.findOneAndUpdate({
          _id: groupId,
          'records.done_tasks_count.date': {$ne: DateTime.now().toISODate() }
        }, { $push: { 'records.done_tasks_count': { date: DateTime.now().toISODate(), count: 1 }}}
        )
        .select('_id');
      }
    } else {
      group = await Group.findOneAndUpdate({
          _id: groupId,
          "records.done_tasks_count.date": DateTime.now().toISODate()
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
