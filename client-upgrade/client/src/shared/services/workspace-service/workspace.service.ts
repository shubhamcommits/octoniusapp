import { Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class WorkspaceService {

  BASE_API_URL = environment.WORKSPACE_BASE_API_URL;


  constructor(
    private _http: HttpClient, 
    private injector: Injector) { }

  /**
   * This function is responsible for fetching the workspace details
   * @param workspaceId 
   */
  getWorkspace(workspaceId: string) {
    return this._http.get<any>(this.BASE_API_URL + '/workspaces/' + workspaceId);
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

    return this._http.put<any>(this.BASE_API_URL + `/workspaces/${ workspaceId }`, formData);
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
   * 
   * @param workspaceId 
   * @param query 
   */
  searchWorkspaceMembers(workspaceId: string, query: string) {
    return this._http.post(this.BASE_API_URL + `/workspaces/query/members/${workspaceId}`, { query })
    .toPromise()
    .catch((err: Error)=>{
     console.log('test');
    })
  }

  /**
   * 
   * @param workspaceId 
   * @param query 
   */
  searchNextWorkspaceMembers(workspaceId: string, query: string) {
    return this._http.post(this.BASE_API_URL + `/workspaces/next/query/members/${ workspaceId }`, { query });
  }


  ///// Workspace billing

  createSubscription(token, amount) {
    const data = { token, amount };
    return this._http.post(this.BASE_API_URL + `/billings/createSubscription`, data);
  }

  getBillingStatus(workspaceId) {
    return this._http.get(this.BASE_API_URL + `/billings/getBillingStatus/${workspaceId}`);
  }

  getSubscription() {
    return this._http.get(this.BASE_API_URL + `/billings/getSubscription`);
  }

  cancelSubscription() {
    return this._http.get(this.BASE_API_URL + `/billings/cancelSubscription`);
  }

  renewSubscription() {
    return this._http.get(this.BASE_API_URL + `/billings/renewSubscription`);
  }

  resumeSubscription() {
    return this._http.get(this.BASE_API_URL + `/billings/resumeSubscription`);
  }

  /**
   * Fetches unique email domains that exist within the given workspace
   * that match the given query.
   * 
   * @param workspaceId The workspace to search within.
   * @param query The email domains to search for.
   */
  getUniqueEmailDomains(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/workspaces/emailDomains/${workspaceId}/${query}`);
  }

  /**
   * Fetches unique job positions that exist within the given workspace
   * that match the given query.
   * 
   * @param workspaceId The workspace to search within.
   * @param query The job positions to search for.
   */
  getUniqueJobPositions(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/workspaces/jobPositions/${workspaceId}/${query}`);
  }

  /**
   * Fetches unique skills that exist within the given workspace
   * that match the given query.
   * 
   * @param workspaceId The workspace to search within.
   * @param query The skills to search for.
   */
  getUniqueSkills(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/workspaces/skills/${workspaceId}/${query}`);
  }
}
