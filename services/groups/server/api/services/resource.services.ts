import { Column } from "../models";
import { DateTime } from 'luxon';

/*  ===============================
 *  -- Resource Service --
 *  ===============================
 */
export class ResourceService {

  async addExpenseToProject(activity: any, resource: any, projectId: string) {
    await Column.findOneAndUpdate({
        _id: projectId
      }, {
        $push: {
          'budget.expenses': {
            amount: activity.quantity * resource.unit_price,
            reason: activity.comment,
            date: DateTime.now(),
            _user: activity._user,
            _resource: resource._id,
            _resource_activity: activity._id,
          }
        }
      }, {
        new: true
      }).lean();
  }

  async deleteExpenseFromProject(activity: any, resourceId: string) {
    const project = await Column.findById({_id: activity._project._id || activity._project})
      .select('budget').lean();

    const index = (!!project.budget.expenses) ? project.budget.expenses.findIndex(e => e._resource == resourceId && e._resource_activity == activity._id) : -1;
    if (index >= 0) {
      await Column.findOneAndUpdate({
          _id: activity._project._id || activity._project
        }, {
          $pull: { 'budget.expenses': { _id: project.budget.expenses[index]._id }}
        }).lean();
    }
  }

  async editExpenseComment(commment: string, projectId: string, resourceId: string, activityId: string) {
    await Column.findOneAndUpdate({
        _id: projectId
      }, {
        $set: {
          "budget.expenses.$[expense].reason": commment
        }
      }, {
        arrayFilters: [{
          "expense._resource": resourceId,
          'expense._resource_activity': activityId
        }],
        new: true
      }).lean();
  }

  async editExpenseDate(date: any, projectId: string, resourceId: string, activityId: string) {
    await Column.findOneAndUpdate({
        _id: projectId
      }, {
        $set: {
          "budget.expenses.$[expense].date": date
        }
      }, {
        arrayFilters: [{
          "expense._resource": resourceId,
          'expense._resource_activity': activityId
        }],
        new: true
      }).lean();
  }

  async editExpenseUser(userId: string, projectId: string, resourceId: string, activityId: string) {
    await Column.findOneAndUpdate({
        _id: projectId
      }, {
        $set: {
          "budget.expenses.$[expense]._user": userId
        }
      }, {
        arrayFilters: [{
          "expense._resource": resourceId,
          'expense._resource_activity': activityId
        }],
        new: true
      }).lean();
  }
}
