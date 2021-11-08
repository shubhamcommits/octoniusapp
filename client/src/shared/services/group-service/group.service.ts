import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})
export class GroupService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.GROUPS_BASE_API_URL;

  /**
   * This function is responsible for fetching the group details
   * @param groupId
   */
  getGroup(groupId: string) {
    return this.getGroupObservale(groupId).toPromise();
  }

  getGroupObservale(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}`);
  }

  /**
   * This function is responsible for deleting the group
   * @param groupId
   */
  removeGroup(groupId: string){
    return this._http.delete(this.baseURL + `/${groupId}`).toPromise()
  }

  /**
   * This function is responsible for archiving the group
   * @param groupId
   */
   archiveGroup(groupId: string, archive: boolean){
    return this._http.put(this.baseURL + `/${groupId}/archive`, { archive: archive }).toPromise()
  }

  /**
   * This function is responsible for updating the group details
   * @param groupId
   */
  updateGroup(groupId: string, groupData: any){
    return this._http.put(this.baseURL + `/${groupId}`, { groupData }).toPromise()
  }

  /**
   * This function is responsible for updating the group avatar
   * @param groupId
   */
  updateGroupAvatar(groupId: any, fileToUpload: File, workspaceId: string) {

    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('groupAvatar', fileToUpload);

    const fileData = {
      _workspace: workspaceId,
      _group: groupId
    }
    formData.append('fileData', JSON.stringify(fileData));
    return this._http.put(this.baseURL + `/${groupId}/image`, formData).toPromise()
  }

  /**
   * This function is responsible for fetching first 10 group members
   * @param groupId
   * @param query - optional parameter(which searches for name and email too)
   */
  getGroupMembers(groupId: string, query?: any) {
    return this._http.get(this.baseURL + `/members`, {
      params: {
        groupId: groupId,
        query: query
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching the next set of group members
   * @param groupId
   * @param lastUserId
   * @param query - optional parameter(which searches for name and email too)
   */
  getNextGroupMembers(groupId: string, lastUserId: string, query?: string) {
    return this._http.get(this.baseURL + `/members/next`, {
      params: {
        groupId: groupId,
        lastUserId: lastUserId,
        query: query
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching all group members
   * @param groupId
   */
  getAllGroupMembers(groupId: string) {
    return this._http.get(this.baseURL + `/members/all`, {
      params: {
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for adding a new user to the group
   * @param groupId
   * @param { _id, role, first_name, email } member
   */
  addNewUserToGroup(groupId: string, member: any){

    // Preparing the Request Body Data
    let bodyData = {
      groupId: groupId,
      member: member
    }

    return this._http.post(this.baseURL + `/members/add`, bodyData)
    .toPromise()
  }

  /**
   * This function is responsible for removing the user from the group
   * @param groupId
   * @param userId - of the user who needs to be removed
   */
  removeUser(groupId: string, userId: string){

    // Preparing the Request Body Data
    let bodyData = {
      groupId: groupId,
      userId: userId
    }

    return this._http.post(this.baseURL + `/members/remove`, bodyData)
    .toPromise()
  }

  addRag(groupId: string, ragTag: string){
    let bodyData = {
      ragTag
    };
    return this._http.put(this.baseURL + `/${groupId}/addRag`, bodyData).toPromise()
  }

  removeRag(groupId: string, ragTag: string){
    let bodyData ={
      ragTag
    };
    return this._http.put(this.baseURL + `/${groupId}/removeRag`, bodyData).toPromise();
  }

  addMemberToRag(groupId: string, ragTag: string, member){
    let bodyData = {
      groupId,
      ragTag,
      member
    }
    return this._http.post(this.baseURL + `/members/addToRag`, bodyData).toPromise();
  }

  removeUserFromRag(groupId: string, ragTag: string, member){
    let bodyData = {
      groupId,
      ragTag,
      member
    }
    return this._http.post(this.baseURL + `/members/removeFromRag`, bodyData).toPromise();
  }

  getRags(groupId: string){
    return this._http.get(this.baseURL + `/${groupId}/getRags`).toPromise()
  }

  saveNewCustomField(newCustomField: { name: string; title: string; values: any[]; }, groupId: any) {
    return this._http.put(this.baseURL + `/${groupId}/customFields`, { newCustomField }).toPromise();
  }

  getGroupCustomFields(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/customFields`).toPromise();
  }

  removeCustomField(fieldId: string, groupId: string) {
    return this._http.delete(this.baseURL + `/${groupId}/customFields/${fieldId}`).toPromise();
  }

  addCustomFieldNewValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/customFields/addValue`, { fieldId, value }).toPromise();
  }

  setCustomFieldDisplayKanbanCard(display_in_kanban_card: boolean, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/customFields/displayInKanbanCard`, { fieldId, display_in_kanban_card }).toPromise();
  }

  setCustomFieldColor(color: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/customFields/color`, { fieldId, color }).toPromise();
  }

  removeCustomFieldValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/customFields/removeValue`, { fieldId, value }).toPromise();
  }

  saveNewFilesCustomField(newCustomField: { name: string; title: string; values: any[]; }, groupId: any) {
    return this._http.put(this.baseURL + `/${groupId}/filesCustomFields`, { newCustomField }).toPromise();
  }

  getGroupFilesCustomFields(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/filesCustomFields`).toPromise();
  }

  removeFilesCustomField(fieldId: string, groupId: string) {
    return this._http.delete(this.baseURL + `/${groupId}/filesCustomFields/${fieldId}`).toPromise();
  }

  addFilesCustomFieldNewValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/filesCustomFields/addValue`, { fieldId, value }).toPromise();
  }

  setFilesCustomFieldColor(color: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/filesCustomFields/color`, { fieldId, color }).toPromise();
  }

  removeFilesCustomFieldValue(value: string, fieldId: string, groupId: string) {
    return this._http.put(this.baseURL + `/${groupId}/filesCustomFields/removeValue`, { fieldId, value }).toPromise();
  }

  saveSettings(groupId: string, settingsData: any) {
    return this._http.put(this.baseURL + `/${groupId}/settings`,{settingsData}).toPromise();
  }

  selectShuttleSection(groupId: string, columnId: string) {
    return this._http.put(this.baseURL + `/${groupId}/settings/selectShuttleSection`, { columnId: columnId }).toPromise();
  }

  /**
   * Makes an HTTP POST request to update a smart group's
   * rules.
   *
   * @param data The new rules to add
   * @param groupId The smart group to update
   */
  updateSmartGroupRules(data: object, groupId: string): Observable<any> {
    return this._http.post<any>(`${this.baseURL}/smart/${groupId}`, data);
  }

  /**
   * Makes an HTTP GET request to retrieve a smart group's
   * current settings.
   *
   * @param groupdId The group to query
   */
  getSmartGroupSettings(groupdId: string): Observable<any> {
    return this._http.get<any>(`${this.baseURL}/smart/${groupdId}/settings`);
  }

  /**
   * Makes an HTTP PUT request that removes a smart group's
   * rule.
   *
   * @param groupId The ID of the smart group.
   * @param rule The rule to delete.
   */
  deleteSmartGroupRule(groupId: string, rule: string, customFieldId?: string): Observable<any> {
    return this._http.put<any>(`${this.baseURL}/smart/${groupId}/${rule}/${customFieldId}`, null);
  }

  /**
   * Makes an HTTP PUT request to update the members of a
   * Smart Group.
   *
   * @param groupId The group to update.
   * @param data The requirements that the users must meet.
   */
  updateSmartGroupMembers(groupId: string, data: object): Observable<any> {
    return this._http.put<any>(`${this.baseURL}/smart/${groupId}`, data);
  }

  getPostsCount(groupId: string, period: any) {
    return this._http.get(this.baseURL + `/${groupId}/postsCount`, {params:{
      period: period
    }}).toPromise();
  }

  /**
   * This function is used to obtain all the tasks of a group of users in specific dates
   * @param allocation
   * @param postId
   */
  getGroupTasksBetweenDays(groupId: string, startDate: any, endDate: any) {
    return this._http.get(this.baseURL + `/${groupId}/tasks-between-days`, {
      params: {
        startDate: startDate,
        endDate: endDate
      }
    }).toPromise()
  }

  /**
   * This method is responsible for saving the widgets to display in the group dashboard page
   * @param groupId
   * @param selectedWidgets
   * @returns
   */
  saveSelectedWidgets(groupId: string, selectedWidgets: string[]) {
    return this._http.put<any>(`${this.baseURL}/${groupId}/saveSelectedWidgets`, {selectedWidgets: selectedWidgets}).toPromise();
  }

  getShuttleTasks(groupId: string) {
    return this._http.get(this.baseURL + `/${groupId}/shuttleTasks`).toPromise();
  }

  /**
   * This method calls the corresponding service to save the settings of the custom fields table settings dialog
   * @param groupId
   * @param settings
   */
  saveCFTableWidgetSettings(groupId: string, settings: any) {
    return this._http.put<any>(`${this.baseURL}/${groupId}/saveCustomFieldsSettings`, {settings: settings}).toPromise();
  }
}
