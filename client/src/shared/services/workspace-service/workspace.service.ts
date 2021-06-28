import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';
import { GroupService } from '../group-service/group.service';
import { GroupsService } from '../groups-service/groups.service';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})

export class WorkspaceService {

  BASE_API_URL = environment.WORKSPACE_BASE_API_URL;

  constructor(
    private _http: HttpClient,
    private injector: Injector,
    private groupsService: GroupsService,
    private groupService: GroupService) { }

  /**
   * This function is responsible for fetching the workspace details
   * @param workspaceId
   */
  getWorkspace(workspaceId: string) {
    return this._http.get<any>(this.BASE_API_URL + '/' + workspaceId);
  }

  /**
   * This function is responsible for updating the workspace data(only workspace_avatar)
   * @param workspaceId
   * @param workspaceAvatar
   */
  updateWorkspace(workspaceId: string, workspaceAvatar: File) {

    // PREPARING FORM DATA
    let formData = new FormData();
    formData.append('workspace_avatar', workspaceAvatar)

    return this._http.put<any>(this.BASE_API_URL + `/${workspaceId}`, formData);
  }

  /**
   * This function is responsible for fetching first 10 workspace members
   * @param workspaceId
   * @param query - optional parameter(which searches for name and email too)
   */
  getWorkspaceMembers(workspaceId: string, query?: any) {
    return this._http.get(this.BASE_API_URL + `/members`, {
      params: {
        workspaceId: workspaceId,
        query: query
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching the next set of workspace members
   * @param workspaceId
   * @param lastUserId
   * @param query - optional parameter(which searches for name and email too)
   */
  getNextWorkspaceMembers(workspaceId: string, lastUserId: string, query?: string) {
    return this._http.get(this.BASE_API_URL + `/members/next`, {
      params: {
        workspaceId: workspaceId,
        lastUserId: lastUserId,
        query: query
      }
    }).toPromise()
  }

  /**
   * This function is responsible for fetching first 10 workspace members who are not present in a group
   * @param workspaceId
   * @param groupId
   * @param query - optional parameter(which searches for name and email too)
   */
  getMembersNotInGroup(workspaceId: string, query?: any, groupId?: string) {
    return this._http.get(this.BASE_API_URL + `/members/groups`, {
      params: {
        workspaceId: workspaceId,
        query: query,
        groupId: groupId
      }
    }).toPromise()
  }

  /**
   *
   * @param workspaceId
   * @param query
   */
  searchWorkspaceMembers(workspaceId: string, query: string) {
    return this._http.post(this.BASE_API_URL + `/query/members/${workspaceId}`, { query })
      .toPromise()
      .catch((err: Error) => {
      })
  }

  /**
   *
   * @param workspaceId
   * @param query
   */
  searchNextWorkspaceMembers(workspaceId: string, query: string) {
    return this._http.post(this.BASE_API_URL + `/next/query/members/${workspaceId}`, { query });
  }

  /**
   *
   * @param userId
   * @param workspaceId
   */
  reactivateUserToWorkplace(userId: string, workspaceId: string) {
    return this._http.post(this.BASE_API_URL + '/members/activate', {
      userId,
      workspaceId
    }).toPromise();
  }

  /**
   *
   * @param userId
   * @param workspaceId
   */
  removeUserFromWorkspace(userId: string, workspaceId: string){
    return this._http.post(this.BASE_API_URL + '/members/delete', {
      userId,
      workspaceId
    }).toPromise();
  }

  /**
   * Fetches unique email domains that exist within the given workspace
   * that match the given query.
   *
   * @param workspaceId The workspace to search within.
   * @param query The email domains to search for.
   */
  getUniqueEmailDomains(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/emailDomains/${workspaceId}/${query}`);
  }

  /**
   * Fetches unique job positions that exist within the given workspace
   * that match the given query.
   *
   * @param workspaceId The workspace to search within.
   * @param query The job positions to search for.
   */
  getUniqueJobPositions(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/jobPositions/${workspaceId}/${query}`);
  }

  /**
   * Fetches unique skills that exist within the given workspace
   * that match the given query.
   *
   * @param workspaceId The workspace to search within.
   * @param query The skills to search for.
   */
  getUniqueSkills(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/skills/${workspaceId}/${query}`);
  }

  /**
   * This function is responsible for fetching users of a workspace
   * @param workspaceId
   */
  getWorkspaceUsers(workspaceId: string) {
    return this._http.get(this.BASE_API_URL + `/members/users`, {
      params: {
        workspaceId: workspaceId
      }
    }).toPromise()
  }

  /**
   * This function is responsible for retreiving and calculating the velocity of the workspace
   */
  async getVelocityGroups(workspaceId: string, dates: any, filteringGroups: any, groupId?: string) {
    let groupsVelocities = [];
    let groups = [];

    if (groupId) {
      await this.groupService.getGroup(groupId).then(res => groups.push(res['group']));
    } else {
      await this.groupsService.getWorkspaceGroups(workspaceId).then((res) => {
        groups = res['groups'];
      });

      if (filteringGroups) {
        groups.filter((group) => {
          return filteringGroups.findIndex(filterGroup => filterGroup == group._id) != -1
        });
      }
    }

    for (let i = 0; i < (dates.length - 1); i++) {
      groupsVelocities.push(this.getVelocityCounterPerDates(dates[i], dates[i+1], groups));
    }
    groupsVelocities.push(this.getVelocityCounterPerDates(dates[dates.length-1], null, groups));

    return groupsVelocities;
  }

  private getVelocityCounterPerDates(fromDate: any, toDate: any, groups: any[]) {
    let returnCounter = 0;

    fromDate = fromDate.format('YYYY-MM-DD');
    if (toDate) {
      toDate = toDate.format('YYYY-MM-DD');
    }

    groups.forEach(group => {
      if (group.records && group.records.done_tasks_count) {
        let doneTasksCount = group.records.done_tasks_count;
        if (toDate) {
          doneTasksCount = doneTasksCount.filter(counter => counter.date >= fromDate && counter.date < toDate);
        } else {
          doneTasksCount = doneTasksCount.filter(counter => counter.date >= fromDate);
        }

        doneTasksCount.forEach(counter => {
          returnCounter += counter.count;
        });
      }
    });
    return returnCounter;
  }

  /**
   * This function is responsible for deleting the workspace
   * @param workspaceId
   */
  removeWorkspace(workspaceId: string) {
    return this._http.delete<any>(`${this.BASE_API_URL}/${workspaceId}`).toPromise();
  }

  /**
   * Start Profile Custom Fields
   */

  saveNewCustomField(newCustomField: { name: string; title: string; values: any[]; }, workspaceId: any) {
    return this._http.put(this.BASE_API_URL + `/${workspaceId}/customFields`, { newCustomField }).toPromise();
  }

  getProfileGroupCustomFields(workspaceId: string) {
    return this._http.get(this.BASE_API_URL + `/${workspaceId}/customFields`).toPromise();
  }

  removeCustomField(fieldId: string, workspaceId: string) {
    return this._http.delete(this.BASE_API_URL + `/${workspaceId}/customFields/${fieldId}`).toPromise();
  }

  addCustomFieldNewValue(value: string, fieldId: string, workspaceId: string) {
    return this._http.put(this.BASE_API_URL + `/${workspaceId}/customFields/addValue`, { fieldId, value }).toPromise();
  }

  removeCustomFieldValue(value: string, fieldId: string, workspaceId: string) {
    return this._http.put(this.BASE_API_URL + `/${workspaceId}/customFields/removeValue`, { fieldId, value }).toPromise();
  }
  /**
   * End Profile Custom Fields
   */
}
