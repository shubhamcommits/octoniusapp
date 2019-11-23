import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/internal/Observable';


@Injectable()
export class WorkspaceService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  getWorkspace(workspaceId: string) {
    return this._http.get<any>(this.BASE_API_URL + '/workspace/' + workspaceId);
  }

  updateWorkspace(workspce_id, data) {
    return this._http.put(this.BASE_API_URL + `/workspace/${workspce_id}`, data);
  }

  getWorkspaceMembers(workspce_id) {
    return this._http.get(this.BASE_API_URL + `/workspace/members/${workspce_id}`);
  }

  getNextWorkspaceMembers(workspce_id, last_id_loaded) {
    return this._http.get(this.BASE_API_URL + `/workspace/next/members/${workspce_id}/${last_id_loaded}`);
  }

  getQueryWorkspaceMembers(workspce_id, query) {
    return this._http.post(this.BASE_API_URL + `/workspace/query/members/${workspce_id}`, { query });
  }
  getNextQueryWorkspaceMembers(workspce_id, query) {
    return this._http.post(this.BASE_API_URL + `/workspace/next/query/members/${workspce_id}`, { query });
  }


  ///// Workspace billing

  createSubscription(token, amount) {
    const data = { token, amount };
    return this._http.post(this.BASE_API_URL + `/billing/createSubscription`, data);
  }

  getBillingStatus(workspaceId) {
    return this._http.get(this.BASE_API_URL + `/billing/getBillingStatus/${workspaceId}`);
  }

  getSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/getSubscription`);
  }

  cancelSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/cancelSubscription`);
  }

  renewSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/renewSubscription`);
  }

  resumeSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/resumeSubscription`);
  }

  /**
   * Fetches unique email domains that exist within the given workspace
   * that match the given query.
   * 
   * @param workspaceId The workspace to search within.
   * @param query The email domains to search for.
   */
  getUniqueEmailDomains(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/workspace/emailDomains/${workspaceId}/${query}`);
  }

  /**
   * Fetches unique job positions that exist within the given workspace
   * that match the given query.
   * 
   * @param workspaceId The workspace to search within.
   * @param query The job positions to search for.
   */
  getUniqueJobPositions(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/workspace/jobPositions/${workspaceId}/${query}`);
  }

  /**
   * Fetches unique skills that exist within the given workspace
   * that match the given query.
   * 
   * @param workspaceId The workspace to search within.
   * @param query The skills to search for.
   */
  getUniqueSkills(workspaceId: string, query: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/workspace/skills/${workspaceId}/${query}`);
  }
}
