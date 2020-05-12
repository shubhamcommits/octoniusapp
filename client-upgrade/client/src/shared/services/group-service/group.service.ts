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
    return this._http.get(this.baseURL + `/${groupId}`).toPromise()
  }

  /**
   * This function is responsible for deleting the group
   * @param groupId 
   */
  removeGroup(groupId: string){
    return this._http.delete(this.baseURL + `/${groupId}`).toPromise()
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
  updateGroupAvatar(groupId: any, fileToUpload: File) {

    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('groupAvatar', fileToUpload)

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
}
