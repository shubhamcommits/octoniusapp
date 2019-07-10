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

@Injectable()
export class GroupService {

  taskStatusChanged = new Subject();
  newTaskAdded = new Subject();

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

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

  getNextFilteredPosts(group_id, filters, alreadyLoaded) {
    const params = new HttpParams()
      .set("normal", filters.normal)
      .set("event", filters.event)
      .set("task", filters.task)
      .set("user", filters.user)
      .set("user_value", filters.user_value);

    return this._http.get(this.BASE_API_URL + `/groups/${group_id}/${alreadyLoaded}/getNextFilteredPosts`, {params});
  }

  getGroupPosts(group_id) {
    return this._http.get(this.BASE_API_URL + '/post/' + group_id);
  }

  getGroup(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id);
  }

  // PULSE start

  getAllPulse() {
    return this._http.get(this.BASE_API_URL + '/groups/all/pulse/');
  }

  getPulseTotalNumTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/totalNumTasks');
  }

  getPulseNumTodoTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/numTodoTasks');
  }

  getPulseNumInProgressTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/numInProgressTasks');
  }

  getPulseNumDoneTasks(group_id) {
    return this._http.get(this.BASE_API_URL + '/group/' + group_id + '/numDoneTasks');
  }

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
    return this._http.get(this.BASE_API_URL + '/groups/' + group_id + '/files/'+file+'/download', {responseType: 'blob' });

  }


  searchWorkspaceUsers(query, workspace) {
    return this._http.get(this.BASE_API_URL + `/workspace/searchWorkspaceUsers/${workspace}/${query}`);
  }

  searchGroupUsers(group_id, query) {
   // console.log('Inside searchGroupUsers');

    //  return this._http.get(this.BASE_API_URL + `/group/searchGroupUsers/${group_id}/${query}`);
    return this._http.get(`${this.BASE_API_URL}/group/searchGroupUsers/${group_id}/${query}`);
  }

  addMembersInGroup(data) {
    return this._http.post(this.BASE_API_URL + '/group/addNewUsers', data);
  }
  updateGroup(group_id, group) {
    return this._http.put(this.BASE_API_URL + `/group/${group_id}`, group);
  }

  removeUserFromGroup(data){
    return this._http.post(this.BASE_API_URL + '/group/removeUser', data);
  }

  getGroupTasks(groupId) {
    return this._http.get<any>(this.BASE_API_URL + `/groups/${groupId}/tasks`);
  }

  getCompletedGroupTasks(groupId) {
    return this._http.get<any>(this.BASE_API_URL + `/groups/${groupId}/tasksDone`);
  }

  getRecentGroupTasks(postId, groupId) {
    return this._http.get<any>(this.BASE_API_URL + `/groups/${groupId}/nextTasksDone/${postId}`);
  }

  changeTaskAssignee(postId, assigneeId){
    return this._http.put(this.BASE_API_URL + `/posts/${postId}/taskAssignee`, assigneeId);
  }

  getPrivateGroup() {
    return this._http.get<any>(this.BASE_API_URL + `/groups/user/private`);
  }

  joinPublicGroup(groupId) {
    return this._http.post(`${this.BASE_API_URL}/groups/public/${groupId}`, null);
  }

  /**
   * Makes an HTTP DELETE request to /api/groups/:groupId
   * in order to delete the group with the given ID.
   *
   * @param groupId The ID of the group to delete.
   */
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
  updateSmartGroupRules(data: object, groupId: string): Observable<any> {
    return this._http.post<any>(`${this.BASE_API_URL}/groups/smart/${groupId}`, data);
  }

  /**
   * Makes an HTTP GET request to retrieve a smart group's
   * current settings.
   * 
   * @param groupdId The group to query
   */
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
  updateSmartGroupMembers(groupId: string, data: object): Observable<any> {
    return this._http.put<any>(`${this.BASE_API_URL}/groups/smart/${groupId}`, data);
  }
}

