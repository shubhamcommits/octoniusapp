import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DateTime } from 'luxon';
import { DatesService } from 'src/shared/services/dates-service/dates.service';
import { UtilityService } from '../utility-service/utility.service';
import moment from 'moment';
import { GroupService } from '../group-service/group.service';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(
    private _http: HttpClient,
    private injector: Injector,) { }

  // BaseUrl of the Post MicroService
  baseURL = environment.POST_BASE_API_URL;

  /**
   * This function is responsible for creating a post
   * @param { title, content, type, _posted_by, _group, _content_mentions } postData
   */
  create(workspaceId: string, formData: FormData) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${workspaceId}`, formData).
      toPromise()
  }

  /**
   * This function is responsible for editing a post
   * @param postId
   * @param formData
   */
  edit(postId: string, workspaceId: string, formData: FormData) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/edit/${workspaceId}`, formData).
      toPromise()
  }

  /**
   * This function is responsible for editing a post title
   * @param postId
   * @param postTitle
   */
  editTitle(postId: string, postTitle: string) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/title`, { postTitle }).toPromise();
  }

  /**
   * This function updates the post quill data
   * @param postId
   * @param portfolioForm
   */
  // editContent(postId: string, postForm: any) {
  //   return this._http.put(this.baseURL + `/${postId}/content`, postForm).toPromise();
  // }

  /**
   * This function is responsible for fetching a post details
   * @param postId
   */
  get(postId: string) {

    // Call the HTTP Request
    return this._http.get(this.baseURL + `/${postId}`).
      toPromise()
  }

  /**
   * This function is responsible for liking a post
   * @param postId
   */
  like(postId: string) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${postId}/like`, '').
      toPromise()
  }

  /**
   * This function is responsible for unliking a post
   * @param postId
   */
  unlike(postId: string) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${postId}/unlike`, '').
      toPromise()
  }

  getLikedByUsers(postId: string) {
    // Call the HTTP Request
    return this._http.get(this.baseURL + `/${postId}/liked-by`).toPromise();
  }

  /**
   * This function is responsible for liking a post
   * @param postId
   */
  follow(postId: string) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${postId}/follow`, '').
      toPromise()
  }

  /**
   * This function is responsible for unliking a post
   * @param postId
   */
  unfollow(postId: string) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${postId}/unfollow`, '').
      toPromise()
  }

  /**
   * This function fetches the list of posts present in a group
   * @param { groupId, type, lastPostId } query
   * @param lastPostId - optional
   */
  getPosts(groupId: string, type: string, pinned: boolean = false, lastPostId?: string, filters?: any) {

    // Create the request variable
    let request: any;

    if (!lastPostId || lastPostId === undefined || lastPostId === null)
      request = this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
          type: type,
          pinned: pinned.toString(),
          filters: JSON.stringify(filters)
        }
      }).toPromise()

    else {
      request = this._http.get(this.baseURL + `/`, {
        params: {
          groupId: groupId,
          type: type,
          lastPostId: lastPostId,
          pinned: pinned.toString(),
          filters: JSON.stringify(filters)
        }
      }).toPromise()
    }

    return request;
  }

  /**
   * This function fetches the list of posts present in a group
   * @param { groupId, type, lastPostId } query
   * @param lastPostId - optional
   */
  getTasksBySection(sectionId: string) {
    return this._http.get(this.baseURL + `/tasksBySection/${sectionId}`, {}).toPromise();
  }

  /**
   *  This function fetches the list of archived tasks present in a group
   * @param groupId
   * @returns
   */
   getArchivedTasks(groupId: string) {
    return this._http.get(this.baseURL + `/archived`, {
        params: {
          groupId: groupId
        }
      }).toPromise();
  }

  /**
   * This function fetches the list of North Star Tasks present in a user´s groups
   * @param { groups } query
   */
  getUserGroupsNorthStarTasks() {
    return this._http.get(this.baseURL + `/user-groups-northstar`).toPromise();
  }

  getUserGlobalNorthStarTasks() {
    return this._http.get(this.baseURL + `/user-global-northstar`).toPromise();
  }

  getUserNorthStarTasks() {
    return this._http.get(this.baseURL + `/user-northstar`).toPromise();
  }

  getGlobalNorthStarTasks() {
    return this._http.get(this.baseURL + `/global-northstar`).toPromise();
  }

  /**
   * This service function is responsible for fetching the tasks and events present in month
   * @param year
   * @param month
   * @param groupId
   * @param userId
   */
  getCalendarPosts(year: any, month: any, groupId: string, userId?: string) {
    if (userId) {
      return this._http.get(this.baseURL + `/calendar/timeline`, {
        params: {
          year: year,
          month: month,
          groupId: groupId,
          userId: userId
        }
      }).toPromise();
    }
    else {
      return this._http.get(this.baseURL + `/calendar/timeline`, {
        params: {
          year: year,
          month: month,
          groupId: groupId
        }
      }).toPromise();
    }
  }

  removeAssigneeFromPost(postId: string, assigneeId: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/remove-assignee`, {
      assigneeId: assigneeId
    }).
      toPromise()
  }

  addAssigneeToPost(postId: string, assigneeId: string, groupId: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/add-assignee`, {
      assigneeId: assigneeId,
      groupId: groupId,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
      isIndividualSubscription: isIndividualSubscription
    }).toPromise();
  }

  /**
   * This function is resposible for changing the task Assignee of a post
   * @param postId
   * @param assigneeId
   */
  changeTaskAssignee(postId: string, assigneeId: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-assignee`, {
      assigneeId: assigneeId,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
      isIndividualSubscription: isIndividualSubscription
    }).
      toPromise()
  }

  /**
   * This function is resposible for changing the task DueDate of a post
   * @param postId
   * @param dateDueTo
   */
  changeTaskDueDate(postId: string, dateDueTo: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-due-date`, {
      date_due_to: dateDueTo,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
      isIndividualSubscription: isIndividualSubscription
    }).
      toPromise()
  }

  /**
   * This function is resposible for changing the task DueDate of a post
   * @param postId
   * @param dateDueTo
   */
  updateGanttTasksDates(postId: string, groupId: string, dateDueTo: string, startdate: string, startdays: number, enddays: number, isShuttleTasksModuleAvailable: boolean) {

    // Call the HTTP Request
    return this._http.post(this.baseURL + `/${postId}/timeline-task-dates-update`, {
      date_due_to: dateDueTo,
      start_date: startdate,
      s_days: startdays,
      e_days: enddays,
      group_id:groupId,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable
    }).
      toPromise()
  }

  /**
   * This function is resposible for changing the task status of a post
   * @param postId
   * @param status
   */
  changeTaskStatus(postId: string, status: string, userId: string, groupId: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-status`, {
      status: status,
      userId: userId,
      groupId: groupId,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
      isIndividualSubscription: isIndividualSubscription
    }).
      toPromise()
  }

  /**
   * This function is responsible for changing the column of a task
   * @param postId
   * @param columnId
   * @param userId
   */
  changeTaskColumn(postId: string, columnId: string, userId: string, groupId: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {

    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/task-column`, {
      columnId: columnId,
      userId: userId,
      groupId: groupId,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
      isIndividualSubscription: isIndividualSubscription
    }).
      toPromise()
  }

  /**
   * This function is resposible for fetching tags from a group
   * @param groupId
   * @param tag
   */
  getTags(groupId: string, tag: string) {

    // Call the HTTP Request
    return this._http.get(this.baseURL + `/group/tags`, {
      params: {
        groupId: (groupId) ? groupId.toString().trim() : '',
        tag: tag.toString().trim()
      }
    }).
      toPromise()
  }


  /**
   * This function is used to delete a post
   * @param postId
   */
  deletePost(postId: string) {
    return this._http.delete(this.baseURL + `/${postId}`).toPromise();
  }

  /**
   * This function is used to save a custom field value
   * @param postId
   */
  saveCustomField(postId: string, customFieldName: string, customFieldTitle: string, customFieldValue: string, groupId: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/customField`, {
      customFieldName: customFieldName,
      customFieldTitle: customFieldTitle,
      customFieldValue: customFieldValue,
      groupId: groupId,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
      isIndividualSubscription: isIndividualSubscription
    }).toPromise();
  }

  /**
   * Workspace's posts
   */
  getWorkspacePosts(workspaceId: string, type: string, numDays: number, overdue: boolean, isNorthStar: boolean, filteringGroups: any) {
    return this._http.get(this.baseURL + `/workspace/posts`, {
      params: {
        workspaceId: workspaceId.toString().trim(),
        type: type.toString().trim(),
        numDays: numDays.toString().trim(),
        overdue: overdue.toString().trim(),
        isNorthStar: isNorthStar.toString().trim(),
        filteringGroups: filteringGroups
      }
    }).toPromise();
  }

  /**
   * Group's posts
   */
  getGroupPosts(groupId: string, type: string, numDays: number, overdue?: boolean) {
    let params = {};

    if (overdue !== undefined) {
      params = {
        groupId: groupId.toString().trim(),
        type: type.toString().trim(),
        numDays: (numDays) ? numDays.toString().trim() : null,
        overdue: overdue.toString().trim()
      };
    } else {
      params = {
        groupId: groupId.toString().trim(),
        type: type.toString().trim(),
        numDays: (numDays) ? numDays.toString().trim() : null
      };
    }
    return this._http.get(this.baseURL + `/group/posts`, {
      params: params
    }).toPromise();
  }

  /**
   * Column's posts
   */
   getColumnPosts(columnId: string, overdue?: boolean) {
    let params = {};

    if (overdue !== undefined) {
      params = {
        columnId: columnId.toString().trim(),
        overdue: overdue.toString().trim()
      };
    } else {
      params = {
        columnId: columnId.toString().trim()
      };
    }
    return this._http.get(this.baseURL + `/column/posts`, {
      params: params
    }).toPromise();
  }

  /**
   * Group's tasks
   */
  getAllGroupTasks(groupId: string, period: string) {
    let params = {};

    params = {
      groupId: groupId.toString().trim(),
      period: period.toString().trim()
    };
    return this._http.get(this.baseURL + `/group/tasks`, {
      params: params
    }).toPromise();
  }

  /**
   * Project's tasks
   */
   getProjectTasks(groupId: string, overdue: boolean) {
    let params = {};

    params = {
      groupId: groupId.toString().trim(),
      overdue: overdue.toString().trim()
    };
    return this._http.get(this.baseURL + `/project/tasks`, {
      params: params
    }).toPromise();
  }

  /**
   * This function is used to save the start or end date of a task
   * @param postId
   */
  saveTaskDates(postId: any, newDate: any, date_field: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/${postId}/update-date`, {
      newDate: newDate,
      date_field: date_field
    }).toPromise();
  }

  /**
   * This function is used to obtain the subtasks of a task
   * @param postId
   */
  getSubTasks(taskId: string) {
    return this._http.get(this.baseURL + `/post/subtasks`, {
      params: {
        parentId: taskId.toString().trim()
      }
    }).toPromise();
  }

  /**
   * This function is used to obtain the subtasks of a task
   * @param postId
   */
  getSubTasksCount(taskId: string) {
    return this._http.get(this.baseURL + `/post/subtasks-count`, {
      params: {
        parentId: taskId.toString().trim()
      }
    }).toPromise();
  }

  transferToGroup(postId: string, groupId: string, columnId: string, oldGroupId: string, userId: string, isCopy: boolean) {
    if (isCopy) {
      return this._http.post(this.baseURL + `/${postId}/copy-to-group`, { postId: postId, groupId: groupId, columnId: columnId, oldGroupId: oldGroupId, userId: userId }).toPromise();
    }
    return this._http.put(this.baseURL + `/${postId}/move-to-group`, { groupId: groupId, columnId: columnId || '', oldGroupId: oldGroupId, userId: userId }).toPromise();
  }

  removeAttachedFile(fileName: string, postId: string) {
    return this._http.post(this.baseURL + `/${postId}/delete-attached`, {
      fileName: fileName
    }).toPromise();
  }

  /**
   * This function is responsible for fetching first 10 tasks
   * @param groupId
   * @param currentPostId
   * @param queryText
   */
  searchPosibleParents(groupId: string, currentPostId: string, queryText: string, type: string) {
    // Call the HTTP Request
    return this._http.get(this.baseURL + `/${currentPostId}/searchParent`, {
      params: {
        groupId: groupId,
        query: queryText,
        field: type
      }
    }).toPromise()
  }

  setParentTask(taskId: string, parentTaskId: string) {
    return this._http.put(this.baseURL + `/${taskId}/set-parent`, { parentTaskId: parentTaskId }).toPromise();
  }

  /**
   * This function is responsible for making task dependency
   */
  setDependencyTask(taskId: string, dependencyTaskId: string) {
    return this._http.put(this.baseURL + `/${taskId}/set-dependency`, { dependencyTaskId: dependencyTaskId }).toPromise();
  }

  /**
   * This function is responsible for removing task dependency
   */
  removeDependencyTask(taskId: string, dependencyTaskId: string) {
    return this._http.put(this.baseURL + `/${taskId}/remove-dependency`, { dependencyTaskId: dependencyTaskId }).toPromise();
  }

  /**
   * This function is responsible for creating a copy of the task assigning it to a specific user
   */
  cloneToAssignee(assignees: any, postId: string) {
    return this._http.post(this.baseURL + `/${postId}/clone-to-assignee`, { postId: postId, assignees: assignees }).toPromise();
  }

  getGroupTemplates(groupId: string) {
    return this._http.get(this.baseURL + `/post/templates`, {
      params: {
        groupId: groupId
      }
    }).toPromise()
  }

  createTemplate(postId: string, groupId: string, templateName: any) {
    return this._http.post(this.baseURL + '/create-template', { postId: postId, groupId: groupId, templateName: templateName }).toPromise();
  }

  overwriteTemplate(postId: string, templateId: string, templateName: string) {
    return this._http.put(this.baseURL + `/${postId}/overwrite-template`, { templateId: templateId, templateName: templateName }).toPromise();
  }

  createTaskFromTemplate(templatePostId: string, postId: string) {
    return this._http.post(this.baseURL + '/create-task-from-template', { templatePostId: templatePostId, postId: postId }).toPromise();
  }

  /**
   * This function is used to save the allocation of a task
   * @param allocation
   * @param postId
   */
  saveAllocation(allocation: string, postId: string) {
    return this._http.put(this.baseURL + `/${postId}/save-allocation`, {
      allocation: allocation
    }).toPromise();
  }

  /**
   * This function is used to save the estimation of a task
   * @param estimation
   * @param postId
   */
  saveEstimation(estimation: any, postId: string) {
    return this._http.put(this.baseURL + `/${postId}/save-estimation`, {
      estimation: estimation
    }).toPromise();
  }

  /**
   * This method is used to pin/unpin a post to the top
   * @param postId
   * @param pin
   * @returns
   */
  pinToTop(postId: string, pin: boolean) {
    return this._http.put(this.baseURL + `/${postId}/pin-to-top`, {
      pin: pin
    }).toPromise();
  }

  voteIdea(postId: string, voteValue: number) {
    return this._http.put(this.baseURL + `/${postId}/vote-idea`, {
      vote: voteValue
    }).toPromise();
  }

  selectShuttleGroup(postId: string, shuttleGroupId: string) {
    return this._http.put(this.baseURL + `/${postId}/selectShuttleGroup`, {
        shuttleGroupId: shuttleGroupId
      }).toPromise();
  }

  selectShuttleSection(postId: string, groupId: string, shuttleSectionId: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {
    return this._http.put(this.baseURL + `/${postId}/selectShuttleSection`, {
        shuttleSectionId: shuttleSectionId,
        groupId: groupId,
        isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
        isIndividualSubscription: isIndividualSubscription
      }).toPromise();
  }

  selectShuttleStatus(postId: string, groupId: string, shuttleStatus: string, isShuttleTasksModuleAvailable: boolean, isIndividualSubscription: boolean) {
    return this._http.put(this.baseURL + `/${postId}/selectShuttleStatus`, {
      shuttleStatus: shuttleStatus,
      groupId: groupId,
      isShuttleTasksModuleAvailable: isShuttleTasksModuleAvailable,
        isIndividualSubscription: isIndividualSubscription
      }).toPromise();
  }

  /**
   *
   * STARTING THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF AN ITEM
   * ITEM = post/section/file/folder
   *
   */
  selectPermissionRight(permissionId: string, postId: string, right: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/post/permissions/${postId}/selectPermissionRight`, { right, permissionId }).toPromise();
  }

  removePermission(permissionId: string, postId: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/post/permissions/${postId}/removePermission`, { permissionId }).toPromise();
  }

  addTagToPermission(permissionId: string, postId: string, tag: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/post/permissions/${postId}/addTagToPermission`, { permissionId, tag }).toPromise();
  }

  removePermissionTag(permissionId: string, postId: string, tag: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/post/permissions/${postId}/removePermissionTag`, { permissionId, tag }).toPromise();
  }

  addMemberToPermission(postId: string, permissionId: string, member: any) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/post/permissions/${postId}/addMemberToPermission`, { permissionId, member }).toPromise();
  }

  removeMemberFromPermission(postId: string, permissionId: string, memberId: string) {
    // Call the HTTP Request
    return this._http.put(this.baseURL + `/post/permissions/${postId}/removeMemberFromPermission`, { permissionId, memberId }).toPromise();
  }
  /**
   *
   * ENDS THE BLOCK OF METHODS TO UPDATE THE RIGHTS OF AN ITEM
   * ITEM = post/section/file/folder
   *
   */

  saveCRMInfo(postId: string, crm_info: any) {
    return this._http.put(this.baseURL + `/${postId}/saveCRMInfo`, { crm_info }).toPromise();
  }

  recalculateCost(postId: string) {
    return this._http.post(this.baseURL + `/${postId}/recalculateCost`, {}).toPromise();
  }

  async sortTasks(tasks: any, sortingBit: any, sortingData: any) {
    const datesService = this.injector.get(DatesService);
    if (sortingBit == 'reverse' || sortingBit == 'inverse') {
      return tasks?.reverse();
    } else {
      return tasks?.sort((t1, t2) => {
        if (sortingBit == 'due_date' || sortingBit == 'none') {
          if (t1.task?.due_to && t2.task?.due_to) {
            if (datesService.isBefore(DateTime.fromISO(t1.task?.due_to), DateTime.fromISO(t2.task?.due_to))) {
              return sortingBit == 'due_date' ? -1 : 1;
            } else {
              return sortingBit == 'due_date' ? 1 : -1;
            }
          } else {
            if (t1.task?.due_to && !t2.task?.due_to) {
              return -1;
            } else if (!t1.task?.due_to && t2.task?.due_to) {
              return 1;
            }
          }
        } else if (sortingBit == 'creation_date') {
          if (t1.created_date && t2.created_date) {
            if (datesService.isBefore(DateTime.fromISO(t1.created_date), DateTime.fromISO(t2.created_date))) {
              return sortingBit == 'creation_date' ? -1 : 1;
            } else {
              return sortingBit == 'creation_date' ? 1 : -1;
            }
          } else {
            if (t1.created_date && !t2.created_date) {
              return -1;
            } else if (!t1.created_date && t2.created_date) {
              return 1;
            }
          }
        } else if (sortingBit == 'custom_field') {
          if (sortingData && sortingData.name == 'priority') {
            return (t1?.task?.custom_fields && t2?.task?.custom_fields)
              ? (((t1?.task?.custom_fields['priority'] == 'High' && t2?.task?.custom_fields['priority'] != 'High') || (t1?.task?.custom_fields['priority'] == 'Medium' && t2?.task?.custom_fields['priority'] == 'Low'))
                ? -1 : (((t1?.task?.custom_fields['priority'] != 'High' && t2?.task?.custom_fields['priority'] == 'High') || (t1?.task?.custom_fields['priority'] == 'Low' && t2?.task?.custom_fields['priority'] == 'Medium'))
                  ? 1 : 0))
              : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
                ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
                  ? 1 : 0);
          } else {
            return (t1?.task?.custom_fields && t2?.task?.custom_fields)
              ? (t1?.task?.custom_fields[sortingData.name] && t2?.task?.custom_fields[sortingData.name])
                ?((t1?.task?.custom_fields[sortingData.name] > t2?.task?.custom_fields[sortingData.name])
                  ? -1 : (t1?.task?.custom_fields < t2?.task?.custom_fields)
                    ? 1 : 0)
              : ((t1?.task?.custom_fields[sortingData.name] && !t2?.task?.custom_fields[sortingData.name])
                ? -1 : ((!t1?.task?.custom_fields[sortingData.name] && t2?.task?.custom_fields[sortingData.name]))
                  ? 1 : 0)
                : ((t1?.task?.custom_fields && !t2?.task?.custom_fields)
                  ? -1 : ((!t1?.task?.custom_fields && t2?.task?.custom_fields))
                    ? 1 : 0);
          }
        } else if (sortingBit == 'tags') {
          if (t1?.tags.length > 0 && t2?.tags.length > 0) {
            const name1 = t1?.tags[0]?.toLowerCase();
            const name2 = t2?.tags[0]?.toLowerCase();
            if (name1 > name2) { return 1; }
            if (name1 < name2) { return -1; }
            return 0;
          } else {
            if (t1?.tags.length > 0 && t2?.tags.length == 0) {
              return -1;
            } else if (t1?.tags.length == 0 && t2?.tags.length > 0) {
              return 1;
            }
          }
        } else if (sortingBit == 'status') {
          return (t1?.task?.status && t2?.task?.status)
            ? (((t1?.task?.status == 'to do' && t2?.task?.status != 'to do') || (t1?.task?.status == 'in progress' && t2?.task?.status == 'done'))
              ? -1 : (((t1?.task?.status != 'to do' && t2?.task?.status == 'to do') || (t1?.task?.status == 'done' && t2?.task?.status == 'in progress'))
                ? 1 : 0))
            : ((t1?.task?.status && !t2?.task?.status)
              ? -1 : ((!t1?.task?.status && t2?.task?.status))
                ? 1 : 0);
        } else if (sortingBit == 'ideas') {
          return ((t1?.task?.idea?.positive_votes?.length || 0 - t1?.task?.idea?.negative_votes?.length || 0) > (t2?.task?.idea?.positive_votes || 0 - t2?.task?.idea?.negative_votes || 0)) ? -1 : 1;
        }
      });
    }
  }

  async filterTasks(tasks: any, filteringBit: any, filteringData: any, userData: any) {
    return tasks?.filter((task: any) => {
      if (filteringBit == "mytask") {
        var bit = false;
        if (task && task._assigned_to) {
          task._assigned_to.forEach(element => {
            if (element._id == userData._id) {
              bit = true
            }
          });
        }
        return bit;
      } else if (filteringBit == 'due_before_today') {
        return (task?.task?.due_to) ? moment.utc(task?.task?.due_to).isBefore(moment().add(-1,'days')) : false;
      } else if (filteringBit == 'due_today'){
        return (task?.task?.due_to) ? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') : false;
      } else if (filteringBit == 'due_today'){
        return (task?.task?.due_to) ? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD') : false;
      } else if (filteringBit == 'due_tomorrow'){
        return (task?.task?.due_to) ? moment.utc(task?.task?.due_to).format('YYYY-MM-DD') == moment().add(1,'days').format('YYYY-MM-DD') : false;
      } else if (filteringBit == 'due_week'){
        const first = moment().startOf('week').format();
        const last = moment().endOf('week').add(1,'days').format();
        if(task?.task?.due_to){
          if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
            return true;
          }else{
            return false;
          }
        } else {
          return false;
        }
      } else if (filteringBit == 'due_next_week'){
        const first = moment().endOf('week').add(1,'days').format();
        const last = moment().endOf('week').add(9,'days').format();
        if(task?.task?.due_to){
          if((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))){
            return true;
          }else{
            return false;
          }
        } else {
          return false;
        }
      } else if (filteringBit == 'due_14_days'){
        const first = moment().format();
        const last = moment().add(14,'days').format();
        if (task?.task?.due_to) {
          if ((moment.utc(task?.task?.due_to).isAfter(first)) && (moment.utc(task?.task?.due_to).isBefore(last))) {
            return true;
          } else {
            return false;
          }
        } else {
          return false;
        }
      } else if (filteringBit == "users") {
        var bit = false;
        if (task && task._assigned_to) {
          task._assigned_to.forEach(element => {
            if (element._id == filteringData) {
              bit = true
            }
          });
        }

        return bit;
      } else if (filteringBit == "custom_field") {
        return (task.task.custom_fields && task.task.custom_fields[filteringData.name] == filteringData.value);
      } else if (filteringBit == "ideas") {
        return (task.task.is_idea == true);
      } else {
        return true;
      }
    });
  }

  filterRAGTasks(tasks: any, groupData: any, userData: any) {

    const utilityService = this.injector.get(UtilityService);

    let tasksTmp = [];

    if (!!tasks) {
      // Filtering other tasks
      tasks.forEach(async task => {
        if (task?.permissions && task?.permissions?.length > 0) {
          const canEdit = await utilityService.canUserDoTaskAction(task, groupData, userData, 'edit');
          let canView = false;
          if (!canEdit) {
            const hide = await utilityService.canUserDoTaskAction(task, groupData, userData, 'hide');
            canView = await utilityService.canUserDoTaskAction(task, groupData, userData, 'view') || !hide;
          }

          if (canEdit || canView) {
            task.canView = true;
            tasks.push(task);
          }
        } else {
          task.canView = true;
          tasks.push(task);
        }
      });
    }

    return tasksTmp;
  }

  async exportTasksTo(exportType: any, sections: any, groupData: any, userData: any, isIdeaModuleAvailable: any) {

    // const utilityService = this.injector.get(UtilityService);
    const groupService = this.injector.get(GroupService);

    let exportTasks = [];
    for (let i = 0; i < sections.length; i++) {
      let section = sections[i];

      await this.getTasksBySection(section?._id).then(async (res) => {
        section.tasks = res['posts']

        if (groupData?.enabled_rights) {
          section.tasks = await this.filterRAGTasks(section.tasks, groupData, userData);
        }
      });

      for (let j = 0; j < section.tasks.length; j++) {

        let post = section.tasks[j];

        let task: any = {
          title: post.title || '',
          posted_by: (post && post._posted_by) ? (post?._posted_by?.first_name + ' ' + post?._posted_by?.last_name) : '',
          created_date: (post?.created_date) ? moment.utc(post?.created_date).format("MMM D, YYYY HH:mm") : '',
          tags: post.tags || '',
          status: post.task.status || '',
        };

        if (post.task.start_date) {
          task.due_to = (post.task.start_date) ? moment.utc(post.task.start_date).format("MMM D, YYYY") : '';
        }
        task.due_to = (post.task.due_to) ? moment.utc(post.task.due_to).format("MMM D, YYYY") : '';

        if (post.task._parent_task) {
          task.section = '';
          task.parent_task = post.task._parent_task.title || '';
        } else {
          task.section = section.title || '';
          task.parent_task = '';
        }

        let assignedTo = '';
        if (post._assigned_to && post._assigned_to.length > 0) {
          post._assigned_to.forEach(user => {
            if (user) {
              assignedTo += user?.first_name + ' ' + user?.last_name + '; ';
            }
          });

          task.assigned_to = assignedTo;
        }

        if (isIdeaModuleAvailable && post.task.is_idea && post.task.idea) {
          task.idea_positive = post?.task?.idea?.positive_votes?.length || 0;
          task.idea_negative = post?.task?.idea?.negative_votes?.length || 0;
          task.idea_count = task.idea_positive - task.idea_negative;
        }

        if (post.task.isNorthStar && post.task.northStar) {
          task.northStar_targetValue = post.task.northStar.target_value || 0;
          let sum = 0;
          if (post.task.northStar.values) {
            for (let k = 0; k < post.task.northStar.values.length; k++) {
              sum += post.task.northStar.values[k];
            }
          }
          task.northStar_currentValue = sum;
          task.northStar_type = post.task.northStar.type;
        }

        exportTasks.push(task);
      }
    }

    groupService.exportTasksToFile(exportType, exportTasks, groupData?.group_name + '_tasks');
  }
}
