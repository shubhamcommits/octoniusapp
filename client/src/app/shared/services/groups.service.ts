import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Subject} from "rxjs/Subject";
import { Observable } from 'rxjs';
import { Cacheable } from 'ngx-cacheable';

@Injectable()
export class GroupsService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  createNewGroup(group) {
    return this._http.post(this.BASE_API_URL + '/workspace/groups/', group);
  }

  @Cacheable()
  getUserGroups(user) {
    return this._http.get(this.BASE_API_URL + '/workspace/groups/' + user.user_id + '/' + user.workspace_id);
  }

  @Cacheable()
  getGroupsForUser(workspace: string) {
    return this._http.get(`${this.BASE_API_URL}/groups/user/${workspace}`);
  }

  @Cacheable()
  getAgoras(): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/groups/public/all`);
  }

  /**
   * Carries out an HTTP GET request that returns a
   * user's smart groups within a workspace.
   * 
   * @param workspace The workspace to search within.
   */
  @Cacheable()
  getSmartGroups(workspace: string): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/groups/smart/${workspace}`);
  }
}
