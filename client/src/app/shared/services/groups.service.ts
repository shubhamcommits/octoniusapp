import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import {Subject,  Observable } from "rxjs";

@Injectable()
export class GroupsService {

  BASE_API_URL = environment.BASE_API_URL;

  constructor(private _http: HttpClient) { }

  createNewGroup(group) {
    return this._http.post(this.BASE_API_URL + '/workspace/groups/', group);
  }


  getUserGroups(user) {
    return this._http.get(this.BASE_API_URL + '/workspace/groups/' + user.user_id + '/' + user.workspace_id);
  }

  getGroupsForUser(workspace: string) {
    return this._http.get(`${this.BASE_API_URL}/groups/user/${workspace}`);
  }

  getAgoras(): Observable<any> {
    return this._http.get<any>(`${this.BASE_API_URL}/groups/public/all`);
  }
}
