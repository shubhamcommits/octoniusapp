import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PostService {

  constructor(private _http: HttpClient) { }

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
    return this._http.post(this.baseURL + `/${postId}/gantt-task-dates-update`, {
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
    return this._http.post(this.baseURL + `${postId}/clone-to-assignee`, { postId: postId, assignees: assignees }).toPromise();
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

  // getTasksPerGroupUserStatusAndDate(groupId: string, userId: string, status: string, dueDate: any) {
  //   return this._http.get(this.baseURL + `/post/tasks-per-user-status-date`, {
  //     params: {
  //       groupId: groupId,
  //       userId: userId,
  //       status: status,
  //       dueDate: dueDate
  //     }
  //   }).toPromise()    
  // }
}
