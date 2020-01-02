import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private _http: HttpClient) { }

  BASE_API_URL = environment.BASE_API_URL;

  getAllPulse(workspaceId: string) {
    return this._http.get(this.BASE_API_URL + '/groups/all/pulse/' + workspaceId);
  }

  getAllPulseQuery(workspaceId: string) {
    return this._http.get(this.BASE_API_URL + '/groups/all/pulse/query/' + workspaceId);
  }

  getNextPulseQuery(workspaceId: string, nextQuery: string) {
    return this._http.get(this.BASE_API_URL + '/groups/all/pulse/query/next/' + workspaceId + '/' + nextQuery);
  }

  getPulseTotalNumTasks(groupId: string) {
    return this._http.get(this.BASE_API_URL + '/group/' + groupId + '/totalNumTasks');
  }

  getPulseNumTodoTasks(groupId: string) {
    return this._http.get(this.BASE_API_URL + '/group/' + groupId + '/numTodoTasks');
  }

  getPulseNumInProgressTasks(groupId: string) {
    return this._http.get(this.BASE_API_URL + '/group/' + groupId + '/numInProgressTasks');
  }

  getPulseNumDoneTasks(groupId: string) {
    return this._http.get(this.BASE_API_URL + '/group/' + groupId + '/numDoneTasks');
  }

  editPulseDesc(groupId: string, description: string) {

    // Preparing Pulse Data
    let pulseData = {
      description: description
    }

    return this._http.post(this.BASE_API_URL + '/groups/' + groupId + '/pulse/editDescription', pulseData);
  }
}
