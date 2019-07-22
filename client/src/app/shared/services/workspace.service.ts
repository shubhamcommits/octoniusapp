
import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import { Cacheable, CacheBuster } from 'ngx-cacheable';
import { DOMStorageStrategy } from 'ngx-cacheable/common/DOMStorageStrategy';

const cacheBuster$ = new Subject<void>();

@Injectable()
export class WorkspaceService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  // @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  // })
  getWorkspace(workspace) {
    return this._http.get<any>(this.BASE_API_URL + '/workspace/' + workspace._id);
  }

  // @CacheBuster({
  //   cacheBusterNotifier: cacheBuster$
  // })
  updateWorkspace(workspce_id, data) {
    return this._http.put(this.BASE_API_URL + `/workspace/${workspce_id}`, data);
  }

  ///// Workspace billing

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  createSubscription(token, amount) {
    const data = {token, amount};
    return this._http.post(this.BASE_API_URL + `/billing/createSubscription`, data);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getBillingStatus(workspaceId) {
    return this._http.get(this.BASE_API_URL + `/billing/getBillingStatus/${workspaceId}`);
  }

  @Cacheable({ cacheBusterObserver: cacheBuster$, storageStrategy: DOMStorageStrategy
  })
  getSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/getSubscription`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  cancelSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/cancelSubscription`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
  renewSubscription() {
    return this._http.get(this.BASE_API_URL + `/billing/renewSubscription`);
  }

  @CacheBuster({
    cacheBusterNotifier: cacheBuster$
  })
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
