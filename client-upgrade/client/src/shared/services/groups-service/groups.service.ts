import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.BASE_API_URL;

  /**
   * This function is responsible for fetching first 10 groups present in a workspace
   * @param workspaceId 
   */
  getPulseGroups(workspaceId: string) {
    return this._http.get(this.baseURL + `/groups/all/pulse/${workspaceId}/groups`)
    .toPromise()
  }

  /**
   * This function is responsible for next 5 groups present in a workspace
   * @param workspaceId 
   * @param lastGroupId 
   */
  getNextPulseGroups(workspaceId: string, lastGroupId: string){
    return this._http.get(this.baseURL + `/groups/all/pulse/${workspaceId}/nextGroups/${lastGroupId}`)
    .toPromise()
  }

  getPulseTotalNumTasks(groupId: string) {
    return this._http.get(this.baseURL + '/group/' + groupId + '/totalNumTasks');
  }

  getPulseNumTodoTasks(groupId: string) {
    return this._http.get(this.baseURL + '/group/' + groupId + '/numTodoTasks');
  }

  getPulseNumInProgressTasks(groupId: string) {
    return this._http.get(this.baseURL + '/group/' + groupId + '/numInProgressTasks');
  }

  getPulseNumDoneTasks(groupId: string) {
    return this._http.get(this.baseURL + '/group/' + groupId + '/numDoneTasks');
  }

  editPulseDesc(groupId: string, description: string) {

    // Preparing Pulse Data
    let pulseData = {
      description: description
    }

    return this._http.post(this.baseURL + '/groups/' + groupId + '/pulse/editDescription', pulseData);
  }
}
