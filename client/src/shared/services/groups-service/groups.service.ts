import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GroupsService {

  constructor(private _http: HttpClient) { }

  baseURL = environment.GROUPS_BASE_API_URL;

  /**
   * This function is responsible for fetching first 10 groups present in a workspace
   * @param workspaceId
   */
   getAllGroupsList(workspaceId: string) {
    return this._http.get(this.baseURL + `/list`, {
      params: {
        workspaceId: workspaceId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching next 5 groups present based on the lastGroupId fetched
   * @param workspaceId
   * @param lastGroupId
   */
   getNextAllGroupsList(workspaceId: string, lastGroupId: string) {
    return this._http.get(this.baseURL + `/list/next`, {
      params: {
        workspaceId: workspaceId,
        lastGroupId: lastGroupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching active groups based on the workspaceId and the query
   * @param workspaceId
   * @param query
   */
   getWorkspaceActiveGroups(workspaceId: string, query: any) {
    return this._http.get(this.baseURL + `/search`, {
      params: {
        workspaceId: workspaceId,
        query: query
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching archived groups based on the workspaceId and the query
   * @param workspaceId
   * @param query
   */
   getWorkspaceArchivedGroups(workspaceId: string, query: any) {
    return this._http.get(this.baseURL + `/search/archived`, {
      params: {
        workspaceId: workspaceId,
        query: query
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching first 10 groups present in a workspace
   * @param workspaceId
   */
   getAllArchivedGroupsList(workspaceId: string) {
    return this._http.get(this.baseURL + `/list/archived`, {
      params: {
        workspaceId: workspaceId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching next 5 groups present based on the lastGroupId fetched
   * @param workspaceId
   * @param lastGroupId
   */
   getNextAllArchivedGroupsList(workspaceId: string, lastGroupId: string) {
    return this._http.get(this.baseURL + `/list/archived/next`, {
      params: {
        workspaceId: workspaceId,
        lastGroupId: lastGroupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching first 10 pulses present in a workspace
   * @param workspaceId
   */
  getPulseGroups(workspaceId: string) {
    return this._http.get(this.baseURL + `/pulse/list`, {
      params: {
        workspaceId: workspaceId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching next 5 pulses present based on the lastGroupId fetched
   * @param workspaceId
   * @param lastGroupId
   */
  getNextPulseGroups(workspaceId: string, lastGroupId: string) {
    return this._http.get(this.baseURL + `/pulse/list/next`, {
      params: {
        workspaceId: workspaceId,
        lastGroupId: lastGroupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for sending the pulse information
   * @param workspaceId
   * @param lastGroupId
   */
  sendPulse(groupId: string, pulse_description: string) {
    return this._http.put(this.baseURL + `/pulse/`, {
      pulse_description: pulse_description
    }, {
      params: {
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching the tasks count based on the groupId and/or status
   * @param groupId
   * @param status
   */
  getPulseTasks(groupId: string, status?: string) {
    if (status) {
      return this._http.get(this.baseURL + `/pulse/tasks`, {
        params: {
          groupId,
          status
        }
      }).toPromise()
    }

    else {
      return this._http.get(this.baseURL + `/pulse/tasks`, {
        params: {
          groupId
        }
      }).toPromise()
    }

  }

  /**
   * This function is responsible for fetching the undone tasks count based on the groupId which were due this week
   * @param groupId
   * @param status
   */
  getUndoneTask(groupId: string){
    return this._http.get(this.baseURL + `/pulse/undone-tasks`, {
      params: {
        groupId: groupId,
      }
    }).toPromise()
  }

  /**
   * This function create a new normal group and makes the POST request
   * @param groupName
   * @param workspace_name
   * @param workspaceId
   * @param userId
   */
  createGroup(groupName: string, workspace_name: string, workspaceId: string, userId: string, type: string) {
    return this._http.post(this.baseURL + `/`, {
      group_name: groupName,
      workspace_name: workspace_name,
      workspaceId: workspaceId,
      userId: userId,
      type: type
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the list of all first 10 groups(normal, agora and smart) for which a user is a part of
   * @param workspaceId
   * @param userId
   */
  getUserGroups(workspaceId: string, userId: string){
    return this._http.get(this.baseURL + `/`, {
      params: {
        workspaceId,
        userId
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the list of next 5 all groups(normal, agora and smart) for which a user is a part of based on the lastGroupId
   * @param workspaceId
   * @param userId
   * @param lastGroupId
   */
  getNextUserGroups(workspaceId: string, userId: string, lastGroupId: string){
    return this._http.get(this.baseURL + `/${lastGroupId}/next`, {
      params: {
        workspaceId,
        userId
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the list of all groups for which a user is a part of
   * @param workspaceId
   * @param userId
   */
   getAllUserGroups(workspaceId: string, userId: string){
    return this._http.get(this.baseURL + `/allUserGroups`, {
      params: {
        workspaceId,
        userId
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the list of all groups for which a user is manager
   * @param workspaceId
   * @param userId
   */
   getAllManagerGroups(workspaceId: string, userId: string){
    return this._http.get(this.baseURL + `/allManagerGroups`, {
      params: {
        workspaceId,
        userId
      }
    }).toPromise();
  }

  getAgoraGroupsNotJoined(workspaceId: string, userId: string){
    return this._http.get(this.baseURL + '/agora/not-joined', {
      params: {
        workspaceId,
        userId
      }
    }).toPromise();
  }

  joinAgora(groupId: string, userId: string){
    return this._http.post(this.baseURL + '/agora/join', {
      groupId,
      userId
    }).toPromise();
  }

  getNextAgoraGroups(workspaceId: string, userId: string, lastGroupId: string){
    return this._http.get(this.baseURL + '/agora/not-joined-next', {
      params: {
        workspaceId,
        userId,
        lastGroupId
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching the list of all groups
   * @param workspaceId
   */
  getWorkspaceGroups(workspaceId: string){
    return this._http.get(this.baseURL + `/workspace/groups`, {
      params: {
        workspaceId: workspaceId
      }
    }).toPromise();
  }

  /**
   * This function is responsible for fetching groups present in a workspace
   * @param workspaceId
   */
  getGlobalPerformanceGroups(workspaceId: string, period: number) {
    return this._http.get(this.baseURL + `/pulse/global-performance`, {
      params: {
        workspaceId: workspaceId,
        period: period.toString().trim()
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching groups present in a workspace
   * @param workspaceId
   */
  getGlobalPerformanceTasks(workspaceId: string, period: number, status: string) {
    return this._http.get(this.baseURL + `/pulse/global-performance-tasks`, {
      params: {
        workspaceId: workspaceId,
        period: period.toString().trim(),
        status: status
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching tasks present in a project
   * @param workspaceId
   */
   getKpiPerformanceTasks(columnId: string, status: string) {
    return this._http.get(this.baseURL + `/pulse/kpi-performance-tasks`, {
      params: {
        columnId: columnId,
        status: status
      }
    }).toPromise()
  }

  /**
   * This function is responsible for sending the pulse information
   * @param workspaceId
   * @param lastGroupId
   */
  sendProjectStatus(groupId: string, status: string) {
    return this._http.put(this.baseURL + `/project/status`, {
      groupId: groupId,
      status: status
    }).toPromise()
  }

  /**
   * This function is responsible for fetching the pulse count based on the workspaceId and period
   * @param workspaceId
   * @param period
   */
  getPulseCount(workspaceId: string, filteringGroups: any, period?: string) {
    return this._http.get(this.baseURL + `/pulse/count`, {
        params: {
          workspaceId,
          period,
          filteringGroups
        }
      }).toPromise()
  }
}
