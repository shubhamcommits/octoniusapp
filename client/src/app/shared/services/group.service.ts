import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import { environment } from '../../../environments/environment';
import {Subject} from "rxjs/Subject";
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { DOMStorageStrategy } from 'ngx-cacheable/common/DOMStorageStrategy';

const cacheBuster$ = new Subject<void>();

@Injectable()
export class GroupService {

  taskStatusChanged = new Subject();
  newTaskAdded = new Subject();

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getFilteredPosts(group_id, filters) {

    console.log(filters,"filters")
    const params = new HttpParams()
      .set("normal", filters.normal)
      .set("event", filters.event)
      .set("task", filters.task)
      .set("user", filters.user)
      .set("user_value", filters.user_value)
      .set("tags", filters.tags)
      .set("tags_value", filters.tags_value)

    return this._http.get(this.BASE_API_URL + `/groups/${group_id}/getFilteredPosts`, {params});
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getNextFilteredPosts(group_id, filters, alreadyLoaded) {
    const params = new HttpParams()
      .set("normal", filters.normal)
      .set("event", filters.event)
      .set("task", filters.task)
      .set("user", filters.user)
      .set("user_value", filters.user_value);

    return this._http.get(this.BASE_API_URL + `/groups/${group_id}/${alreadyLoaded}/getNextFilteredPosts`, {params});
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/post/' + group_id);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getTasksUndoneLastWeek(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/undone/lastWeek');
  }
  // PULSE start

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getAllPulse(workspaceId) {
    return this._http.get(this.BASE_API_URL + '/groups/all/pulse/' + workspaceId);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getPulseTotalNumTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/totalNumTasks');
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getPulseNumTodoTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/numTodoTasks');
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getPulseNumInProgressTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/numInProgressTasks');
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getPulseNumDoneTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/numDoneTasks');
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  editPulseDesc(group_id, description) {
    return this._http.post(this.BASE_API_URL + '/groups/' + group_id + '/pulse/editDescription', description);
  }
  // PULSE end

  getGroupFiles(group_id) {

    return this._http.get(this.BASE_API_URL + '/groups/' + group_id + '/files');
  }
  getDocFileForEditorImport(post_id) {

    return this._http.get(this.BASE_API_URL + '/groups/' + post_id + '/docImport');
  }

  serveDocFileForEditorExport(post_id,group_id, editorInfo) {
    return this._http.post(this.BASE_API_URL + '/groups/' + post_id + '/docExport', {'editorInfo': editorInfo, 'postID':post_id, 'groupID':group_id });
  }

  downloadGroupFile(group_id, file){
    return this._http.get(this.BASE_API_URL + '/groups/' + group_id + '/files/' + file + '/download', {responseType: 'blob' });
  }

  deleteFile(group_id, file) {
    return this._http.delete(this.BASE_API_URL + '/groups/' + group_id + '/files/' + file );
  }

  searchWorkspaceUsers(query, workspace) {
    return this._http.get(this.BASE_API_URL + `/workspace/searchWorkspaceUsers/${workspace}/${query}`);
  }

  getAllGroupUsers(group_id) {
    return this._http.get(`${this.BASE_API_URL}/group/getAllGroupUsers/${group_id}`);
  }

  searchGroupUsers(group_id, query) {
    return this._http.get(`${this.BASE_API_URL}/group/searchGroupUsers/${group_id}/${query}`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  addMembersInGroup(data) {
    return this._http.post(this.BASE_API_URL + '/group/addNewUsers', data);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  updateGroup(group_id, group) {
    return this._http.put(this.BASE_API_URL + `/group/${group_id}`, group);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  removeUserFromGroup(data){
    return this._http.post(this.BASE_API_URL + '/group/removeUser', data);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getGroupTasks(groupId) {
    return this._http.get<any>(this.BASE_API_URL + `/groups/${groupId}/tasks`);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getCompletedGroupTasks(groupId) {
    return this._http.get<any>(this.BASE_API_URL + `/groups/${groupId}/tasksDone`);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getRecentGroupTasks(postId, groupId) {
    return this._http.get<any>(this.BASE_API_URL + `/groups/${groupId}/nextTasksDone/${postId}`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  changeTaskAssignee(postId, assigneeId){
    return this._http.put(this.BASE_API_URL + `/posts/${postId}/taskAssignee`, assigneeId);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getPrivateGroup() {
    return this._http.get<any>(this.BASE_API_URL + `/groups/user/private`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  joinPublicGroup(groupId) {
    return this._http.post(`${this.BASE_API_URL}/groups/public/${groupId}`, null);
  }

  /**
   * Makes an HTTP DELETE request to /api/groups/:groupId
   * in order to delete the group with the given ID.
   *
   * @param groupId The ID of the group to delete.
   */
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  deleteGroup(groupId: string): Observable<any> {
    return this._http.delete<any>(`${this.BASE_API_URL}/groups/${groupId}`);
  }

  /**
   * Makes an HTTP POST request to update a smart group's
   * rules.
   *
   * @param data The new rules to add
   * @param groupId The smart group to update
   */
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  updateSmartGroupRules(data: object, groupId: string): Observable<any> {
    return this._http.post<any>(`${this.BASE_API_URL}/groups/smart/${groupId}`, data);
  }

  /**
   * Makes an HTTP GET request to retrieve a smart group's
   * current settings.
   *
   * @param groupdId The group to query
   */
  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getSmartGroupSettings(groupdId: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/groups/smart/${groupdId}/settings`);
  }

  /**
   * Makes an HTTP PUT request that removes a smart group's
   * rule.
   *
   * @param groupId The ID of the smart group.
   * @param rule The rule to delete.
   */
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  deleteSmartGroupRule(groupId: string, rule: string): Observable<any> {
    return this._http.put<any>(`${this.BASE_API_URL}/groups/smart/${groupId}/${rule}`, null);
  }

  /**
   * Makes an HTTP PUT request to update the members of a
   * Smart Group.
   *
   * @param groupId The group to update.
   * @param data The requirements that the users must meet.
   */
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  updateSmartGroupMembers(groupId: string, data: object): Observable<any> {
    return this._http.put<any>(`${this.BASE_API_URL}/groups/smart/${groupId}`, data);
  }

  /**
   * Makes an HTTP GET request to retrieve every smart group
   * within the given workspace and its rules.
   */
  getAllSmartGroupRules(workspaceId: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/groups/${workspaceId}/smart/rules`);
  }
  //Group files start
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
    getGroupSharedFileCheck(group_id){
      return this._http.get<any>(this.BASE_API_URL + `/groups/${group_id}/sharedFileCheck`);
    }
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
    updateSharedFile(group_id, checkbool){
      return this._http.put<any>(this.BASE_API_URL + `/groups/${group_id}/updateSharedFile`, {checkbool:checkbool});
    }
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
    getAllSharedGroupFiles(group_id,workspace_id,user_id){
      return this._http.get<any>(this.BASE_API_URL + `/groups/${group_id}/allGroupSharedFile/${workspace_id}/${user_id}`);
    }   
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
    addGroupFileInFileSection(group_id,user_id,add_files){
      return this._http.post<any>(this.BASE_API_URL + `/groupFileUploads/${group_id}/FilesUpload/${user_id}`, add_files);
    }   
  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
    getGroupFileInFileSection(group_id){
      return this._http.get<any>(this.BASE_API_URL + `/groupFileUploads/${group_id}/allGroupFiles`);
    }   
  //Group files end
}

